import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { sendBookingConfirmationEmail, sendBookingRejectionEmail } from '@/lib/mail';

// Helper to get session user
async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('userSession');
  if (!sessionCookie) return null;
  try {
    const parsed = JSON.parse(sessionCookie.value);
    if (!parsed || !parsed.id) return null;
    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role.toLowerCase(),
      isActive: parsed.isActive
    };
  } catch {
    return null;
  }
}

// 1. GET: Fetch all pending room bookings
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Access denied: Manager permissions required' }, { status: 403 });
    }

    const pendingRequests = await prisma.booking.findMany({
      where: { status: 'Pending' },
      include: {
        room: true,
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        attendees: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(pendingRequests);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch pending requests: ' + error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Manager/Admin approves or rejects a request
// Uses sequential queries with optimistic locking instead of interactive $transaction
// to avoid Prisma transaction timeout errors on slower DB connections.
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Access denied: Manager permissions required' }, { status: 403 });
    }

    const { bookingId, action, reason } = await request.json(); // action: "Approve" | "Reject"

    if (!bookingId || !action) {
      return NextResponse.json(
        { error: 'Fields: bookingId and action are required' },
        { status: 400 }
      );
    }

    const parsedBookingId = parseInt(bookingId);

    // Step 1: Fetch the booking with all relations
    const booking = await prisma.booking.findUnique({
      where: { id: parsedBookingId },
      include: {
        user: true,
        room: {
          include: { floor: true }
        },
        attendees: true,
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking request not found' }, { status: 404 });
    }

    if (booking.status !== 'Pending') {
      return NextResponse.json({ error: 'This booking is not in a pending state' }, { status: 400 });
    }

    if (action === 'Approve') {
      // Step 2a: Verify room is available
      if (booking.room.status !== 'Available') {
        return NextResponse.json(
          { error: 'Cannot approve because the room is not Available (e.g. Maintenance)' },
          { status: 400 }
        );
      }

      // Step 2b: Verify no confirmed booking overlaps
      const overlap = await prisma.booking.findFirst({
        where: {
          roomId: booking.roomId,
          status: 'Confirmed',
          OR: [
            { startTime: { lte: booking.startTime }, endTime: { gt: booking.startTime } },
            { startTime: { lt: booking.endTime }, endTime: { gte: booking.endTime } },
            { startTime: { gte: booking.startTime }, endTime: { lte: booking.endTime } },
          ],
        }
      });

      if (overlap) {
        return NextResponse.json(
          { error: 'Cannot approve because another booking overlaps with this time slot' },
          { status: 409 }
        );
      }

      // Step 3a: Optimistic update — only succeeds if booking is still 'Pending'
      const updated = await prisma.booking.updateMany({
        where: { id: parsedBookingId, status: 'Pending' },
        data: { status: 'Confirmed' },
      });

      if (updated.count === 0) {
        return NextResponse.json(
          { error: 'Booking was already processed by another manager' },
          { status: 409 }
        );
      }

      // Step 4a: Record history (outside transaction — safe to retry)
      await prisma.bookingHistory.create({
        data: {
          bookingId: parsedBookingId,
          action: 'Approved',
          performedBy: user.email,
        },
      });

      // Step 5a: Send confirmation emails
      const locationLabel = booking.room.location || `Room ${booking.room.roomNumber}, ${booking.room.floor.name}`;

      sendBookingConfirmationEmail(
        booking.id,
        booking.user.email,
        booking.user.name,
        booking.room.name,
        locationLabel,
        booking.startTime,
        booking.endTime,
        booking.title
      ).catch(e => console.error(`Failed to send approval confirmation email to ${booking.user.email}:`, e));

      // Create in-app notification for booker
      (prisma as any).notification.create({
        data: {
          userId: booking.userId,
          title: 'Booking Approved!',
          message: `Your request for ${booking.room.name} ("${booking.title}") has been approved by ${user.name}.`,
          type: 'success',
        }
      }).catch((e: any) => console.error('Failed to create approval notification for booker:', e));

      if (Array.isArray(booking.attendees)) {
        for (const attendee of booking.attendees) {
          sendBookingConfirmationEmail(
            booking.id,
            attendee.email,
            'Valued Attendee',
            booking.room.name,
            locationLabel,
            booking.startTime,
            booking.endTime,
            booking.title
          ).catch(e => console.error(`Failed to send attendee email to ${attendee.email}:`, e));

          prisma.user.findUnique({ where: { email: attendee.email } }).then(attUser => {
            if (attUser) {
              (prisma as any).notification.create({
                data: {
                  userId: attUser.id,
                  title: 'Meeting Confirmed',
                  message: `The meeting "${booking.title}" in ${booking.room.name} has been approved and confirmed.`,
                  type: 'info',
                }
              }).catch((e: any) => console.error(`Failed to create notification for attendee ${attendee.email}:`, e));
            }
          }).catch((e: any) => console.error(`Failed to lookup attendee user ${attendee.email}:`, e));
        }
      }

      // Also reject all other pending bookings that collide with the now-confirmed slot
      const collidingPending = await prisma.booking.findMany({
        where: {
          id: { not: parsedBookingId },
          roomId: booking.roomId,
          status: 'Pending',
          OR: [
            { startTime: { lte: booking.startTime }, endTime: { gt: booking.startTime } },
            { startTime: { lt: booking.endTime }, endTime: { gte: booking.endTime } },
            { startTime: { gte: booking.startTime }, endTime: { lte: booking.endTime } },
          ],
        },
        include: { user: true },
      });

      if (collidingPending.length > 0) {
        await prisma.booking.updateMany({
          where: { id: { in: collidingPending.map(b => b.id) } },
          data: { status: 'Cancelled' },
        });

        for (const cb of collidingPending) {
          await prisma.bookingHistory.create({
            data: {
              bookingId: cb.id,
              action: 'Auto-rejected (slot confirmed for another booking)',
              performedBy: user.email,
            },
          });

          sendBookingRejectionEmail(
            cb.user.email,
            cb.user.name,
            booking.room.name,
            locationLabel,
            cb.startTime,
            cb.endTime,
            cb.title,
            'Another booking was approved for this time slot'
          ).catch(e => console.error(`Failed to send auto-rejection email to ${cb.user.email}:`, e));

          (prisma as any).notification.create({
            data: {
              userId: cb.userId,
              title: 'Booking Request Declined',
              message: `Your request for ${booking.room.name} ("${cb.title}") was declined because another booking was confirmed for this slot.`,
              type: 'error',
            }
          }).catch((e: any) => console.error(`Failed to create auto-rejection notification for ${cb.user.email}:`, e));
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Booking request successfully approved',
      });
    } else {
      // Reject path
      const updated = await prisma.booking.updateMany({
        where: { id: parsedBookingId, status: 'Pending' },
        data: { status: 'Cancelled' },
      });

      if (updated.count === 0) {
        return NextResponse.json(
          { error: 'Booking was already processed by another manager' },
          { status: 409 }
        );
      }

      await prisma.bookingHistory.create({
        data: {
          bookingId: parsedBookingId,
          action: 'Rejected',
          performedBy: user.email,
        },
      });

      const locationLabel = booking.room.location || `Room ${booking.room.roomNumber}, ${booking.room.floor.name}`;

      sendBookingRejectionEmail(
        booking.user.email,
        booking.user.name,
        booking.room.name,
        locationLabel,
        booking.startTime,
        booking.endTime,
        booking.title,
        reason || 'Declined by manager'
      ).catch(e => console.error(`Failed to send rejection email to ${booking.user.email}:`, e));

      (prisma as any).notification.create({
        data: {
          userId: booking.userId,
          title: 'Booking Request Declined',
          message: `Your request for ${booking.room.name} ("${booking.title}") was declined by manager (${reason || 'Declined'}).`,
          type: 'error',
        }
      }).catch((e: any) => console.error('Failed to create rejection notification for booker:', e));

      return NextResponse.json({
        success: true,
        message: 'Booking request successfully rejected',
      });
    }
  } catch (error: any) {
    console.error('Approval processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process request: ' + error.message },
      { status: 500 }
    );
  }
}

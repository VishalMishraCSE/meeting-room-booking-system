import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { sendBookingConfirmationEmail, sendBookingRejectionEmail } from '@/lib/mail';
import { Prisma } from '@prisma/client';

// Helper to get session user
async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('userSession');
  if (!sessionCookie) return null;
  try {
    const parsed = JSON.parse(sessionCookie.value);
    if (!parsed || !parsed.id) return null;
    const dbUser = await prisma.user.findUnique({
      where: { id: parsed.id }
    });
    if (!dbUser) return null;
    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role.toLowerCase(),
      isActive: dbUser.isActive
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

// 2. POST: Manager approves or rejects a request
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

    // Run inside serializable transaction to prevent race conditions (double bookings)
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const booking = await tx.booking.findUnique({
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
        throw new Error('NOT_FOUND');
      }

      if (booking.status !== 'Pending') {
        throw new Error('NOT_PENDING');
      }

      if (action === 'Approve') {
        // Verify room is available
        if (booking.room.status !== 'Available') {
          throw new Error('ROOM_UNAVAILABLE');
        }

        // Verify there is no confirmed booking overlap
        const overlap = await tx.booking.findFirst({
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
          throw new Error('COLLISION');
        }

        const updated = await tx.booking.update({
          where: { id: parsedBookingId },
          data: { status: 'Confirmed' },
        });

        await tx.bookingHistory.create({
          data: {
            bookingId: parsedBookingId,
            action: 'Approved',
            performedBy: user.email,
          },
        });

        return { booking, updated };
      } else {
        const updated = await tx.booking.update({
          where: { id: parsedBookingId },
          data: { status: 'Cancelled' },
        });

        await tx.bookingHistory.create({
          data: {
            bookingId: parsedBookingId,
            action: 'Rejected',
            performedBy: user.email,
          },
        });

        return { booking, updated };
      }
    }, {
      isolationLevel: 'ReadCommitted'
    });

    const { booking, updated } = result;
    const locationLabel = booking.room.location || `Room ${booking.room.roomNumber}, ${booking.room.floor.name}`;

    if (action === 'Approve') {
      // Send confirmation to booker
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

      // Send confirmation to all invited attendees
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
        }
      }
    } else {
      // Send rejection notification
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
    }

    return NextResponse.json({
      success: true,
      message: `Booking request successfully ${action === 'Approve' ? 'approved' : 'rejected'}`,
      booking: updated,
    });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Booking request not found' }, { status: 404 });
    }
    if (error.message === 'NOT_PENDING') {
      return NextResponse.json({ error: 'This booking is not in a pending state' }, { status: 400 });
    }
    if (error.message === 'ROOM_UNAVAILABLE') {
      return NextResponse.json({ error: 'Cannot approve because the room is not Available (e.g. Maintenance)' }, { status: 400 });
    }
    if (error.message === 'COLLISION') {
      return NextResponse.json({ error: 'Cannot approve because another booking overlaps with this time slot' }, { status: 409 });
    }
    return NextResponse.json(
      { error: 'Failed to process request: ' + error.message },
      { status: 500 }
    );
  }
}

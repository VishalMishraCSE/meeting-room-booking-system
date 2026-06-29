import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { sendMeetingExtensionNoticeEmail } from '@/lib/mail';

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('userSession');
  if (!sessionCookie) return null;
  try {
    const parsed = JSON.parse(sessionCookie.value);
    if (!parsed || !parsed.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

// POST /api/bookings/[id]/extend — Extend meeting duration by custom minutes/hours
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
    if (!user || (user.role !== 'Manager' && user.role !== 'Admin')) {
      return NextResponse.json(
        { error: 'Only Managers and System Admins have authority to extend meeting reservations' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const parsedBookingId = parseInt(id, 10);
    if (isNaN(parsedBookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const extensionMinutes = parseInt(body.extensionMinutes || body.minutes || '30', 10);
    if (isNaN(extensionMinutes) || extensionMinutes <= 0) {
      return NextResponse.json({ error: 'Invalid extension duration' }, { status: 400 });
    }

    const targetBooking = await prisma.booking.findUnique({
      where: { id: parsedBookingId },
      include: {
        room: { include: { floor: true } },
        user: true,
        attendees: true,
      },
    });

    if (!targetBooking || targetBooking.status === 'Cancelled') {
      return NextResponse.json({ error: 'Active booking not found' }, { status: 404 });
    }

    const oldEndTime = new Date(targetBooking.endTime);
    const newEndTime = new Date(oldEndTime.getTime() + extensionMinutes * 60 * 1000);

    // Update target booking's endTime in database
    const updatedBooking = await prisma.booking.update({
      where: { id: parsedBookingId },
      data: {
        endTime: newEndTime,
      },
    });

    const locationLabel = targetBooking.room.location || `Room ${targetBooking.room.roomNumber}, ${targetBooking.room.floor.name}`;
    const durationText = extensionMinutes >= 60 
      ? `${(extensionMinutes / 60).toFixed(1).replace('.0', '')} hour(s)` 
      : `${extensionMinutes} minutes`;

    await prisma.bookingHistory.create({
      data: {
        bookingId: parsedBookingId,
        action: `Extended by ${durationText} by ${user.name} (${user.role})`,
        performedBy: user.email,
      },
    });

    // Create confirmation in-app notification for extending manager/admin
    (prisma as any).notification.create({
      data: {
        userId: user.id,
        title: 'Meeting Extended Successfully',
        message: `Reservation for ${targetBooking.room.name} ("${targetBooking.title}") was extended by ${durationText}.`,
        type: 'success',
      }
    }).catch((e: any) => console.error('Failed to notify extender:', e));

    // Detect overlapping upcoming bookings in the extended window
    const collidingUpcoming = await prisma.booking.findMany({
      where: {
        id: { not: parsedBookingId },
        roomId: targetBooking.roomId,
        status: { in: ['Confirmed', 'Pending'] },
        startTime: { lt: newEndTime },
        endTime: { gt: oldEndTime },
      },
      include: {
        user: true,
        attendees: true,
      },
    });

    if (collidingUpcoming.length > 0) {
      // Cancel colliding bookings and dispatch notifications
      await prisma.booking.updateMany({
        where: { id: { in: collidingUpcoming.map(b => b.id) } },
        data: { status: 'Cancelled' },
      });

      for (const cb of collidingUpcoming) {
        await prisma.bookingHistory.create({
          data: {
            bookingId: cb.id,
            action: `Auto-rescheduled: Preceding meeting extended by management`,
            performedBy: user.email,
          },
        });

        // Send Email Notice to booker
        sendMeetingExtensionNoticeEmail(
          cb.user.email,
          cb.user.name,
          targetBooking.room.name,
          locationLabel,
          cb.title,
          durationText,
          `Extended by ${user.name} (${user.role})`
        ).catch(e => console.error(`Failed to send overrun email to ${cb.user.email}:`, e));

        // Send In-App Notification to booker
        (prisma as any).notification.create({
          data: {
            userId: cb.userId,
            title: 'Meeting Rescheduled Alert',
            message: `The preceding meeting in ${targetBooking.room.name} ran over time (+${durationText}). Your meeting "${cb.title}" has been updated.`,
            type: 'warning',
          }
        }).catch((e: any) => console.error(`Failed to notify booker ${cb.user.email}:`, e));

        // Notify attendees
        if (Array.isArray(cb.attendees)) {
          for (const att of cb.attendees) {
            sendMeetingExtensionNoticeEmail(
              att.email,
              'Valued Attendee',
              targetBooking.room.name,
              locationLabel,
              cb.title,
              durationText
            ).catch(e => console.error(`Failed to send overrun email to attendee ${att.email}:`, e));

            prisma.user.findUnique({ where: { email: att.email } }).then(attUser => {
              if (attUser) {
                (prisma as any).notification.create({
                  data: {
                    userId: attUser.id,
                    title: 'Meeting Rescheduled Alert',
                    message: `The meeting "${cb.title}" in ${targetBooking.room.name} was rescheduled due to an executive session overrun (+${durationText}).`,
                    type: 'warning',
                  }
                }).catch((e: any) => console.error(`Failed to notify attendee ${att.email}:`, e));
              }
            }).catch((e: any) => console.error(`Failed to lookup attendee user ${att.email}:`, e));
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Meeting successfully extended by ${durationText}.`,
      updatedBooking,
      collidingCount: collidingUpcoming.length,
    });
  } catch (error: any) {
    console.error('Extension processing error:', error);
    return NextResponse.json(
      { error: 'Failed to extend meeting: ' + error.message },
      { status: 500 }
    );
  }
}

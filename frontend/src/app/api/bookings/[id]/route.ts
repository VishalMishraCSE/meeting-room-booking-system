import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { sendBookingCancellationEmail } from '@/lib/mail';
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

// DELETE: Cancel a reservation (privileged access for Managers/Admins or ownership verify)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = parseInt(id);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        room: {
          include: { floor: true }
        },
        attendees: true,
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check permissions
    if (booking.userId !== user.id && user.role !== 'admin' && user.role !== 'manager') {
      return NextResponse.json(
        { error: 'Access denied: You can only cancel your own bookings' },
        { status: 403 }
      );
    }

    // Soft delete / cancel the reservation to preserve history log records
    const cancelledBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'Cancelled' },
    });

    // Create history record
    await prisma.bookingHistory.create({
      data: {
        bookingId,
        action: 'Cancelled',
        performedBy: user.email,
      },
    });

    // Send cancellation emails in background
    const locationLabel = booking.room.location || `Room ${booking.room.roomNumber}, ${booking.room.floor.name}`;
    const cancelReason = user.id === booking.userId ? 'cancelled by organizer' : `cancelled by ${user.name} (${user.role})`;

    // Booker notification
    sendBookingCancellationEmail(
      booking.id,
      booking.user.email,
      booking.user.name,
      booking.room.name,
      locationLabel,
      booking.startTime,
      booking.endTime,
      booking.title,
      cancelReason
    ).catch(e => console.error(`Failed to send cancellation to booker ${booking.user.email}:`, e));

    // Attendees notifications
    if (Array.isArray(booking.attendees)) {
      for (const attendee of booking.attendees) {
        sendBookingCancellationEmail(
          booking.id,
          attendee.email,
          'Valued Attendee',
          booking.room.name,
          locationLabel,
          booking.startTime,
          booking.endTime,
          booking.title,
          cancelReason
        ).catch(e => console.error(`Failed to send cancellation to attendee ${attendee.email}:`, e));
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Reservation cancelled successfully',
      booking: cancelledBooking,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to cancel booking: ' + error.message },
      { status: 500 }
    );
  }
}

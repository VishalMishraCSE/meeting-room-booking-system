import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { sendMaintenanceAlertEmail, sendBookingCancellationEmail } from '@/lib/mail';
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

// 1. PATCH: Admin edits room details or toggles maintenance status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied: Admin permissions required' }, { status: 403 });
    }

    const { id } = await params;
    const roomId = parseInt(id);
    const updates = await request.json();

    const dataToUpdate: any = {};
    if (updates.name !== undefined) dataToUpdate.name = updates.name;
    if (updates.roomNumber !== undefined) dataToUpdate.roomNumber = updates.roomNumber;
    if (updates.capacity !== undefined) dataToUpdate.capacity = parseInt(updates.capacity);
    if (updates.floorId !== undefined) dataToUpdate.floorId = parseInt(updates.floorId);
    if (updates.location !== undefined) dataToUpdate.location = updates.location;
    if (updates.description !== undefined) dataToUpdate.description = updates.description;
    if (updates.status !== undefined) dataToUpdate.status = updates.status;
    if (updates.heroImageUrl !== undefined) dataToUpdate.heroImageUrl = updates.heroImageUrl;

    // Handle amenities updates
    if (updates.amenities !== undefined && Array.isArray(updates.amenities)) {
      // Remove old amenities
      await prisma.roomAmenity.deleteMany({
        where: { roomId },
      });
      // Map and create new ones
      const mappedAmenities = updates.amenities.map((name: string) => {
        let icon = 'info';
        if (name === 'Video Conf') icon = 'videocam';
        else if (name === 'Whiteboard') icon = 'desktop_windows';
        else if (name === 'Projector') icon = 'cast';
        else if (name === 'TV') icon = 'tv';
        return { name, icon };
      });
      dataToUpdate.amenities = {
        create: mappedAmenities,
      };
    }

    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: dataToUpdate,
      include: {
        floor: true,
        amenities: true,
      },
    });

    // Alert admins if room is set to Maintenance mode
    if (updates.status === 'Maintenance') {
      prisma.user.findMany({
        where: { role: 'Admin', isActive: true }
      }).then((admins: any[]) => {
        for (const adm of admins) {
          sendMaintenanceAlertEmail(
            adm.email,
            adm.name,
            updatedRoom.name,
            updatedRoom.roomNumber,
            'Maintenance'
          ).catch((e: any) => console.error(`Failed to alert admin ${adm.email}:`, e));
        }
      }).catch((e: any) => console.error('Failed to fetch admins for alert:', e));
    }

    return NextResponse.json(updatedRoom);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update room: ' + error.message },
      { status: 500 }
    );
  }
}

// 2. DELETE: Admin deletes a room with cascading safety
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied: Admin permissions required' }, { status: 403 });
    }

    const { id } = await params;
    const roomId = parseInt(id);

    // 1. Cascade delete all dependencies safely in a transaction and capture affected future bookings
    const futureBookingsToNotify = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomBookings = await tx.booking.findMany({
        where: { roomId },
        include: {
          user: true,
          attendees: true,
          room: true,
        }
      });
      const bookingIds = roomBookings.map((b: any) => b.id);

      const now = new Date();
      const futureBookings = roomBookings.filter((b: any) => b.endTime > now && b.status !== 'Cancelled');

      // Delete dependencies
      if (bookingIds.length > 0) {
        await tx.attendee.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.bookingHistory.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.booking.deleteMany({ where: { id: { in: bookingIds } } });
      }

      await tx.roomAmenity.deleteMany({ where: { roomId } });
      await tx.roomPhoto.deleteMany({ where: { roomId } });
      await tx.favorite.deleteMany({ where: { roomId } });

      // Delete the room
      await tx.room.delete({
        where: { id: roomId },
      });

      return futureBookings;
    }, {
      timeout: 10000,
    });

    // 2. Send email cancellation notices to affected users in the background
    for (const booking of futureBookingsToNotify) {
      const locationLabel = booking.room.location || `Room ${booking.room.roomNumber}`;
      
      // Notify booker
      sendBookingCancellationEmail(
        booking.id,
        booking.user.email,
        booking.user.name,
        booking.room.name,
        locationLabel,
        booking.startTime,
        booking.endTime,
        booking.title,
        'this room was permanently decommissioned or deleted by an administrator'
      ).catch(e => console.error(`Failed to send cancellation to booker ${booking.user.email}:`, e));

      // Notify attendees
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
          'this room was permanently decommissioned or deleted by an administrator'
        ).catch(e => console.error(`Failed to send cancellation to attendee ${attendee.email}:`, e));
      }
    }

    return NextResponse.json({ success: true, message: `Room and all associated bookings deleted successfully` });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete room: ' + error.message },
      { status: 500 }
    );
  }
}

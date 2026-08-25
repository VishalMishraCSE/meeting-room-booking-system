import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { sendMeetingExtensionNoticeEmail } from '@/lib/mail';

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('userSession');
  if (!sessionCookie || !sessionCookie.value) return null;
  try {
    const parsed = JSON.parse(sessionCookie.value);
    if (!parsed || !parsed.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

// POST /api/bookings/[id]/extend — Request meeting extension (Employee & Manager) or direct Admin extension
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
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const parsedBookingId = parseInt(id, 10);
    if (isNaN(parsedBookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const extensionMinutes = parseInt(body.extensionMinutes || body.minutes || '30', 10);
    const reason = body.reason ? body.reason.trim() : 'Meeting extension requested by team';
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

    const durationText = extensionMinutes >= 60 
      ? `${(extensionMinutes / 60).toFixed(1).replace('.0', '')} hour(s)` 
      : `${extensionMinutes} minutes`;

    // If requester is NOT an Admin: Extensions MUST go through Admin Approval
    if (user.role !== 'Admin') {
      const updatedBooking = await prisma.booking.update({
        where: { id: parsedBookingId },
        data: {
          pendingExtensionMinutes: extensionMinutes,
          extensionReason: reason,
          extensionStatus: 'Pending',
        },
      });

      await prisma.bookingHistory.create({
        data: {
          bookingId: parsedBookingId,
          action: `Extension requested (+${durationText}) by ${user.name} (${user.role}) - Awaiting Admin Approval`,
          performedBy: user.email,
        },
      });

      // Notify Admins about the pending extension request
      const admins = await prisma.user.findMany({ where: { role: 'Admin', isActive: true } });
      for (const admin of admins) {
        (prisma as any).notification.create({
          data: {
            userId: admin.id,
            title: 'Meeting Extension Approval Required',
            message: `${user.name} requested a +${durationText} extension for "${targetBooking.title}" in ${targetBooking.room.name}.`,
            type: 'warning',
          }
        }).catch((e: any) => console.error('Failed to notify admin:', e));
      }

      // Notify requester that request has been dispatched to Admin
      (prisma as any).notification.create({
        data: {
          userId: user.id,
          title: 'Extension Request Submitted',
          message: `Your +${durationText} extension request for ${targetBooking.room.name} has been submitted to Admin for approval.`,
          type: 'info',
        }
      }).catch((e: any) => console.error('Failed to notify requester:', e));

      return NextResponse.json({
        success: true,
        pendingApproval: true,
        message: `Meeting extension request for +${durationText} submitted successfully. Awaiting Admin Approval.`,
        booking: updatedBooking,
      });
    }

    // DIRECT ADMIN EXECUTION
    return await applyMeetingExtension(parsedBookingId, targetBooking, extensionMinutes, user);
  } catch (error: any) {
    console.error('Extension request error:', error);
    return NextResponse.json(
      { error: 'Failed to process extension request: ' + error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/[id]/extend — Admin Approval / Rejection of meeting extension requests
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { id: sessionUser.id } });
    if (!admin || admin.role !== 'Admin') {
      return NextResponse.json(
        { error: 'Forbidden: Only System Admins have authority to approve or reject meeting extensions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const parsedBookingId = parseInt(id, 10);
    if (isNaN(parsedBookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body; // 'Approve' or 'Reject'

    const targetBooking = await prisma.booking.findUnique({
      where: { id: parsedBookingId },
      include: {
        room: { include: { floor: true } },
        user: true,
        attendees: true,
      },
    });

    if (!targetBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!targetBooking.pendingExtensionMinutes && targetBooking.extensionStatus !== 'Pending') {
      return NextResponse.json({ error: 'No pending extension request found for this booking' }, { status: 400 });
    }

    const extensionMinutes = targetBooking.pendingExtensionMinutes || 30;
    const durationText = extensionMinutes >= 60 
      ? `${(extensionMinutes / 60).toFixed(1).replace('.0', '')} hour(s)` 
      : `${extensionMinutes} minutes`;

    if (action === 'Reject') {
      const updated = await prisma.booking.update({
        where: { id: parsedBookingId },
        data: {
          pendingExtensionMinutes: null,
          extensionStatus: 'Rejected',
        },
      });

      await prisma.bookingHistory.create({
        data: {
          bookingId: parsedBookingId,
          action: `Extension request (+${durationText}) rejected by Admin ${admin.name}`,
          performedBy: admin.email,
        },
      });

      // Notify the booker
      (prisma as any).notification.create({
        data: {
          userId: targetBooking.userId,
          title: 'Meeting Extension Rejected',
          message: `Your +${durationText} extension request for ${targetBooking.room.name} ("${targetBooking.title}") was not approved by Admin.`,
          type: 'error',
        }
      }).catch((e: any) => console.error('Failed to notify booker:', e));

      return NextResponse.json({
        success: true,
        message: 'Extension request has been rejected',
        booking: updated,
      });
    }

    // APPROVE EXTENSION
    return await applyMeetingExtension(parsedBookingId, targetBooking, extensionMinutes, admin);
  } catch (error: any) {
    console.error('Extension decision error:', error);
    return NextResponse.json(
      { error: 'Failed to decide on extension: ' + error.message },
      { status: 500 }
    );
  }
}

// Helper to calculate new endTime, update database, resolve conflicts, and send alerts
async function applyMeetingExtension(
  parsedBookingId: number,
  targetBooking: any,
  extensionMinutes: number,
  adminUser: any
) {
  const oldEndTime = new Date(targetBooking.endTime);
  const newEndTime = new Date(oldEndTime.getTime() + extensionMinutes * 60 * 1000);

  const durationText = extensionMinutes >= 60 
    ? `${(extensionMinutes / 60).toFixed(1).replace('.0', '')} hour(s)` 
    : `${extensionMinutes} minutes`;

  const updatedBooking = await prisma.booking.update({
    where: { id: parsedBookingId },
    data: {
      endTime: newEndTime,
      pendingExtensionMinutes: null,
      extensionStatus: 'Approved',
    },
  });

  const locationLabel = targetBooking.room.location || `Room ${targetBooking.room.roomNumber}, ${targetBooking.room.floor.name}`;

  await prisma.bookingHistory.create({
    data: {
      bookingId: parsedBookingId,
      action: `Extension approved (+${durationText}) by Admin ${adminUser.name}`,
      performedBy: adminUser.email,
    },
  });

  // Notify Booker
  (prisma as any).notification.create({
    data: {
      userId: targetBooking.userId,
      title: 'Meeting Extension Approved!',
      message: `Your extension for ${targetBooking.room.name} ("${targetBooking.title}") has been approved by Admin (+${durationText}).`,
      type: 'success',
    }
  }).catch((e: any) => console.error('Failed to notify booker:', e));

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
    await prisma.booking.updateMany({
      where: { id: { in: collidingUpcoming.map(b => b.id) } },
      data: { status: 'Cancelled' },
    });

    for (const cb of collidingUpcoming) {
      await prisma.bookingHistory.create({
        data: {
          bookingId: cb.id,
          action: `Auto-rescheduled: Preceding meeting extended by Admin decision`,
          performedBy: adminUser.email,
        },
      });

      sendMeetingExtensionNoticeEmail(
        cb.user.email,
        cb.user.name,
        targetBooking.room.name,
        locationLabel,
        cb.title,
        durationText,
        `Approved by Admin ${adminUser.name}`
      ).catch(e => console.error(`Failed to send overrun email to ${cb.user.email}:`, e));

      (prisma as any).notification.create({
        data: {
          userId: cb.userId,
          title: 'Meeting Rescheduled Alert',
          message: `The preceding meeting in ${targetBooking.room.name} was granted an extension (+${durationText}). Your meeting "${cb.title}" has been updated.`,
          type: 'warning',
        }
      }).catch((e: any) => console.error(`Failed to notify booker ${cb.user.email}:`, e));
    }
  }

  return NextResponse.json({
    success: true,
    message: `Meeting extension of +${durationText} approved and applied successfully.`,
    updatedBooking,
    collidingCount: collidingUpcoming.length,
  });
}

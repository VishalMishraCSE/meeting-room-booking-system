import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { sendBookingConfirmationEmail, sendApprovalRequestEmail, sendBookingCancellationEmail } from '@/lib/mail';

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

// 1. GET: Fetch all bookings
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        room: true,
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        attendees: true,
      },
      orderBy: { startTime: 'asc' },
    });
    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch bookings: ' + error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Create a new booking
// Uses sequential queries instead of interactive $transaction to avoid timeout errors.
// Includes duplicate-booking guard and role-based authority enforcement.
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Corporate account is deactivated' }, { status: 403 });
    }

    const {
      roomId,
      startTime,
      endTime,
      title,
      agenda,
      attendees, // Array of email strings
      preempt, // Boolean: If true, Admin cancels conflicting booking
    } = await request.json();

    if (!roomId || !startTime || !endTime || !title) {
      return NextResponse.json(
        { error: 'Fields: roomId, startTime, endTime, and title are required' },
        { status: 400 }
      );
    }

    const roomParsedId = parseInt(roomId);
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Input Validations
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid date/time format' }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json({ error: 'Start time must be strictly before end time' }, { status: 400 });
    }

    // Allow 5-minute past buffer for local client time variations, but block historical bookings
    const pastThreshold = new Date(Date.now() - 5 * 60 * 1000);
    if (start < pastThreshold) {
      return NextResponse.json({ error: 'Cannot book meeting slots in the past' }, { status: 400 });
    }

    // Verify room exists
    const room = await prisma.room.findUnique({
      where: { id: roomParsedId },
      include: { floor: true }
    });
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    if (room.status !== 'Available') {
      return NextResponse.json({ error: `This room is not available (Status: ${room.status})` }, { status: 400 });
    }

    // Filter and sanitize attendee emails
    const validAttendees = Array.isArray(attendees)
      ? attendees.filter((email: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return email && emailRegex.test(email.trim());
        }).map((email: string) => email.trim())
      : [];

    // ── Duplicate guard: same user, same room, same time, not cancelled ──
    const selfDuplicate = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        roomId: roomParsedId,
        status: { in: ['Pending', 'Confirmed'] },
        startTime: start,
        endTime: end,
      },
    });

    if (selfDuplicate) {
      return NextResponse.json(
        { error: 'You already have a booking for this exact slot. Please wait for it to be processed.' },
        { status: 409 }
      );
    }

    // ── Collision check: any Confirmed OR Pending booking for this room/time ──
    const timeOverlapFilter = {
      roomId: roomParsedId,
      status: { in: ['Confirmed', 'Pending'] },
      OR: [
        { startTime: { lte: start }, endTime: { gt: start } },
        { startTime: { lt: end }, endTime: { gte: end } },
        { startTime: { gte: start }, endTime: { lte: end } },
      ],
    };

    const conflict = await prisma.booking.findFirst({
      where: timeOverlapFilter,
      include: {
        user: true,
        attendees: true,
      },
    });

    const isAdmin = user.role === 'admin';
    const initialStatus = user.role === 'employee' ? 'Pending' : 'Confirmed';

    if (conflict) {
      // Admin with preempt flag can override any booking (Confirmed or Pending)
      if (preempt && isAdmin) {
        // Cancel the conflicting booking
        await prisma.booking.update({
          where: { id: conflict.id },
          data: { status: 'Cancelled' },
        });

        await prisma.bookingHistory.create({
          data: {
            bookingId: conflict.id,
            action: 'Preempted',
            performedBy: user.email,
          },
        });

        // Notify the preempted booker
        const locationLabel = room.location || `Room ${room.roomNumber}, ${room.floor.name}`;
        sendBookingCancellationEmail(
          conflict.id,
          conflict.user.email,
          conflict.user.name,
          room.name,
          locationLabel,
          conflict.startTime,
          conflict.endTime,
          conflict.title,
          `preempted by administrative priority by ${user.name}`
        ).catch(e => console.error(`Failed to send cancellation to booker ${conflict.user.email}:`, e));

        if (Array.isArray(conflict.attendees)) {
          for (const att of conflict.attendees) {
            sendBookingCancellationEmail(
              conflict.id,
              att.email,
              'Valued Attendee',
              room.name,
              locationLabel,
              conflict.startTime,
              conflict.endTime,
              conflict.title,
              `preempted by administrative priority by ${user.name}`
            ).catch(e => console.error(`Failed to send cancellation to attendee ${att.email}:`, e));
          }
        }

        // Also cancel any other overlapping Pending/Confirmed bookings
        const otherConflicts = await prisma.booking.findMany({
          where: {
            ...timeOverlapFilter,
            id: { not: conflict.id },
          },
        });
        if (otherConflicts.length > 0) {
          await prisma.booking.updateMany({
            where: { id: { in: otherConflicts.map(b => b.id) } },
            data: { status: 'Cancelled' },
          });
        }
      } else {
        // Employee or Manager without preempt: block the booking
        return NextResponse.json(
          {
            error: 'This time slot is already reserved.',
            conflict: { id: conflict.id, title: conflict.title }
          },
          { status: 409 }
        );
      }
    }

    // ── Create the new booking ──
    const newBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        roomId: roomParsedId,
        startTime: start,
        endTime: end,
        title,
        agenda,
        status: initialStatus,
        attendees: {
          create: validAttendees.map((email: string) => ({ email, status: 'Pending' })),
        },
        history: {
          create: [
            { action: 'Created', performedBy: user.email },
          ],
        },
      },
      include: {
        attendees: true,
      },
    });

    // ── Send emails and create in-app notifications asynchronously after successful creation ──
    const locationLabel = room.location || `Room ${room.roomNumber}, ${room.floor.name}`;
    const timeFormatted = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    if (initialStatus === 'Confirmed') {
      // Send confirmation to booker
      sendBookingConfirmationEmail(
        newBooking.id,
        user.email,
        user.name,
        room.name,
        locationLabel,
        start,
        end,
        title
      ).catch(e => console.error('Failed to send booking confirmation email to booker:', e));

      // Create in-app notification for booker
      (prisma as any).notification.create({
        data: {
          userId: user.id,
          title: 'Booking Confirmed',
          message: `Your reservation for ${room.name} (${title}) on ${start.toLocaleDateString()} at ${timeFormatted} is confirmed.`,
          type: 'success',
        }
      }).catch((e: any) => console.error('Failed to create in-app notification for booker:', e));

      // Send confirmation & create in-app notification for attendees
      for (const attendeeEmail of validAttendees) {
        sendBookingConfirmationEmail(
          newBooking.id,
          attendeeEmail,
          'Valued Attendee',
          room.name,
          locationLabel,
          start,
          end,
          title
        ).catch(e => console.error(`Failed to send attendee email to ${attendeeEmail}:`, e));

        // Find matching user ID by email to send in-app notification
        prisma.user.findUnique({ where: { email: attendeeEmail } }).then(attUser => {
          if (attUser) {
            (prisma as any).notification.create({
              data: {
                userId: attUser.id,
                title: 'Meeting Invitation',
                message: `You have been added as an attendee to "${title}" in ${room.name} by ${user.name} for ${start.toLocaleDateString()} at ${timeFormatted}.`,
                type: 'info',
              }
            }).catch((e: any) => console.error(`Failed to create notification for attendee ${attendeeEmail}:`, e));
          }
        }).catch((e: any) => console.error(`Failed to lookup attendee user ${attendeeEmail}:`, e));
      }
    } else {
      // Create in-app notification for employee booker that request is pending
      (prisma as any).notification.create({
        data: {
          userId: user.id,
          title: 'Booking Request Submitted',
          message: `Your request for ${room.name} (${title}) has been submitted and is pending manager approval.`,
          type: 'warning',
        }
      }).catch((e: any) => console.error('Failed to create pending notification for booker:', e));

      // Notify managers about the approval request
      prisma.user.findMany({
        where: { role: 'Manager', isActive: true }
      }).then((managers: { id: number; email: string; name: string }[]) => {
        for (const mgr of managers) {
          sendApprovalRequestEmail(
            mgr.email,
            mgr.name,
            user.name,
            room.name,
            locationLabel,
            start,
            end,
            title
          ).catch((e: unknown) => console.error(`Failed to notify manager ${mgr.email}:`, e));

          (prisma as any).notification.create({
            data: {
              userId: mgr.id,
              title: 'Pending Room Approval Request',
              message: `${user.name} requested to book ${room.name} for "${title}" on ${start.toLocaleDateString()} at ${timeFormatted}.`,
              type: 'info',
            }
          }).catch((e: any) => console.error(`Failed to create in-app notification for manager ${mgr.email}:`, e));
        }
      }).catch((e: unknown) => console.error('Failed to fetch managers for notification:', e));
    }

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error: any) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule booking: ' + error.message },
      { status: 500 }
    );
  }
}

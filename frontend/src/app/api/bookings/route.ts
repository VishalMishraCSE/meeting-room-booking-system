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
export async function POST(request: Request) {
  let queryRoomId: any = null;
  let queryStartStr: string = "";
  let queryEndStr: string = "";

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

    queryRoomId = roomId;
    queryStartStr = startTime;
    queryEndStr = endTime;

    if (!roomId || !startTime || !endTime || !title) {
      return NextResponse.json(
        { error: 'Fields: roomId, startTime, endTime, and title are required' },
        { status: 400 }
      );
    }

    const roomParsedId = parseInt(roomId);
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Concurrency / Input Validations
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
        }).map(email => email.trim())
      : [];

    const initialStatus = user.role === 'employee' ? 'Pending' : 'Confirmed';
    let preemptedBooking: any = null;

    // Execute in SERIALIZABLE transaction context to prevent race conditions and concurrent double-bookings
    const result = await prisma.$transaction(async (tx) => {
      // Find conflicting booking for the same room
      const conflict = await tx.booking.findFirst({
        where: {
          roomId: roomParsedId,
          status: 'Confirmed',
          OR: [
            { startTime: { lte: start }, endTime: { gt: start } },
            { startTime: { lt: end }, endTime: { gte: end } },
            { startTime: { gte: start }, endTime: { lte: end } },
          ],
        },
        include: {
          user: true,
          attendees: true,
        }
      });

      if (conflict) {
        if (preempt && (user.role === 'admin' || user.role === 'manager')) {
          // Preempt and cancel conflict
          await tx.booking.update({
            where: { id: conflict.id },
            data: { status: 'Cancelled' },
          });

          await tx.bookingHistory.create({
            data: {
              bookingId: conflict.id,
              action: 'Preempted',
              performedBy: user.email,
            },
          });
          preemptedBooking = conflict;
        } else {
          throw new Error('COLLISION');
        }
      }

      // Create new reservation
      const newB = await tx.booking.create({
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

      return { newB, preemptedBooking };
    }, {
      isolationLevel: 'ReadCommitted'
    });

    const newBooking = result.newB;
    const preempted = result.preemptedBooking;

    // Send emails asynchronously after transaction commits successfully
    if (preempted) {
      const locationLabel = room.location || `Room ${room.roomNumber}, ${room.floor.name}`;
      
      // Email preempted booker
      sendBookingCancellationEmail(
        preempted.id,
        preempted.user.email,
        preempted.user.name,
        room.name,
        locationLabel,
        preempted.startTime,
        preempted.endTime,
        preempted.title,
        `preempted by administrative priority by ${user.name}`
      ).catch(e => console.error(`Failed to send cancellation to booker ${preempted.user.email}:`, e));

      // Email all preempted attendees
      if (Array.isArray(preempted.attendees)) {
        for (const att of preempted.attendees) {
          sendBookingCancellationEmail(
            preempted.id,
            att.email,
            'Valued Attendee',
            room.name,
            locationLabel,
            preempted.startTime,
            preempted.endTime,
            preempted.title,
            `preempted by administrative priority by ${user.name}`
          ).catch(e => console.error(`Failed to send cancellation to attendee ${att.email}:`, e));
        }
      }
    }

    if (initialStatus === 'Confirmed') {
      const locationLabel = room.location || `Room ${room.roomNumber}, ${room.floor.name}`;
      
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

      // Send confirmation to attendees
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
      }
    } else {
      // Notify managers about the approval request
      prisma.user.findMany({
        where: { role: 'Manager', isActive: true }
      }).then(managers => {
        const locationLabel = room.location || `Room ${room.roomNumber}, ${room.floor.name}`;
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
          ).catch(e => console.error(`Failed to notify manager ${mgr.email}:`, e));
        }
      }).catch(e => console.error('Failed to fetch managers for notification:', e));
    }

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error: any) {
    if (error.message === 'COLLISION') {
      const conflict = await prisma.booking.findFirst({
        where: {
          roomId: parseInt(queryRoomId),
          status: 'Confirmed',
          OR: [
            { startTime: { lte: new Date(queryStartStr) }, endTime: { gt: new Date(queryStartStr) } },
            { startTime: { lt: new Date(queryEndStr) }, endTime: { gte: new Date(queryEndStr) } },
            { startTime: { gte: new Date(queryStartStr) }, endTime: { lte: new Date(queryEndStr) } },
          ],
        }
      });
      return NextResponse.json(
        { 
          error: 'This time slot is already reserved.',
          conflict: conflict ? { id: conflict.id, title: conflict.title } : undefined
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to schedule booking: ' + error.message },
      { status: 500 }
    );
  }
}

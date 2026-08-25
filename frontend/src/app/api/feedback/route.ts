import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { sendFeedbackToAdmin } from '@/lib/mail';

async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('userSession');
  if (!sessionCookie || !sessionCookie.value) return null;
  try {
    const session = JSON.parse(sessionCookie.value);
    if (!session || !session.id) return null;
    return session;
  } catch {
    return null;
  }
}

// GET /api/feedback — Get pending feedback prompt for logged in user, list room reviews, or all feedbacks (admin)
export async function GET(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const pendingOnly = searchParams.get('pendingOnly') === 'true';
  const allFeedbacks = searchParams.get('all') === 'true';

  // Admin-only: return ALL feedback from all users
  if (allFeedbacks && sessionUser.role === 'admin') {
    try {
      const feedbacks = await prisma.meetingFeedback.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          room: { select: { id: true, name: true, roomNumber: true, location: true } },
          booking: { select: { id: true, title: true, startTime: true, endTime: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ feedbacks });
    } catch (error: any) {
      return NextResponse.json({ error: 'Failed to fetch all feedbacks: ' + error.message }, { status: 500 });
    }
  }

  try {
    if (pendingOnly) {
      const now = new Date();

      // Find user's past confirmed bookings where no feedback has been submitted
      const userBookings = await prisma.booking.findMany({
        where: {
          status: 'Confirmed',
          endTime: { lte: now },
          OR: [
            { userId: sessionUser.id },
            { attendees: { some: { email: sessionUser.email } } }
          ],
          feedbacks: {
            none: {
              userId: sessionUser.id
            }
          }
        },
        include: {
          room: { select: { id: true, name: true, roomNumber: true, location: true, heroImageUrl: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { endTime: 'desc' },
        take: 3
      });

      return NextResponse.json({ pendingFeedbacks: userBookings });
    }

    if (roomId) {
      const feedbacks = await prisma.meetingFeedback.findMany({
        where: { roomId: parseInt(roomId, 10) },
        include: {
          user: { select: { id: true, name: true, role: true } },
          booking: { select: { id: true, title: true, startTime: true, endTime: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });

      return NextResponse.json({ feedbacks });
    }

    const feedbacks = await prisma.meetingFeedback.findMany({
      where: { userId: sessionUser.id },
      include: {
        room: { select: { id: true, name: true } },
        booking: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ feedbacks });
  } catch (error: any) {
    console.error('Feedback query error:', error);
    return NextResponse.json({ error: 'Failed to query feedbacks: ' + error.message }, { status: 500 });
  }
}

// POST /api/feedback — Submit 1-5 star rating and review for a meeting room
export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookingId, roomId, rating, comment } = body;

    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5 stars' }, { status: 400 });
    }

    let targetRoomId = roomId ? parseInt(roomId.toString(), 10) : null;
    let targetBookingId = bookingId ? parseInt(bookingId.toString(), 10) : null;

    if (!targetBookingId && !targetRoomId) {
      return NextResponse.json({ error: 'bookingId or roomId is required' }, { status: 400 });
    }

    if (targetBookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: targetBookingId },
        include: { attendees: true }
      });

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      targetRoomId = booking.roomId;

      // Upsert feedback
      const feedback = await prisma.meetingFeedback.upsert({
        where: {
          bookingId_userId: {
            bookingId: targetBookingId,
            userId: sessionUser.id
          }
        },
        create: {
          bookingId: targetBookingId,
          userId: sessionUser.id,
          roomId: targetRoomId,
          rating: parsedRating,
          comment: comment ? comment.trim() : null
        },
        update: {
          rating: parsedRating,
          comment: comment ? comment.trim() : null
        }
      });

      // Recalculate room avgRating
      const aggregations = await prisma.meetingFeedback.aggregate({
        where: { roomId: targetRoomId },
        _avg: { rating: true },
        _count: { rating: true }
      });

      const newAvg = aggregations._avg.rating ? parseFloat(aggregations._avg.rating.toFixed(1)) : parsedRating;

      await prisma.room.update({
        where: { id: targetRoomId },
        data: { avgRating: newAvg }
      });

      // Notify admin via email (fire-and-forget)
      try {
        const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
        const bookingDetails = await prisma.booking.findUnique({
          where: { id: targetBookingId },
          include: { room: true, user: true }
        });
        if (adminUser && bookingDetails) {
          sendFeedbackToAdmin({
            adminEmail: adminUser.email,
            userName: sessionUser.name || sessionUser.email,
            userEmail: sessionUser.email,
            roomName: bookingDetails.room?.name || 'Unknown Room',
            bookingTitle: bookingDetails.title,
            rating: parsedRating,
            comment: comment ? comment.trim() : null,
          }).catch((e) => console.error('Admin feedback email failed:', e));
        }
      } catch (e) {
        console.error('Could not notify admin of feedback:', e);
      }

      return NextResponse.json({
        success: true,
        message: 'Feedback submitted successfully. Thank you for your review!',
        feedback,
        avgRating: newAvg,
        reviewCount: aggregations._count.rating
      });
    }

    // Direct room feedback without specific booking
    if (!targetRoomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    const recentBooking = await prisma.booking.findFirst({
      where: { roomId: targetRoomId },
      orderBy: { id: 'desc' }
    });

    if (!recentBooking) {
      return NextResponse.json({ error: 'Cannot review a room with no booking records' }, { status: 400 });
    }

    const feedback = await prisma.meetingFeedback.create({
      data: {
        bookingId: recentBooking.id,
        userId: sessionUser.id,
        roomId: targetRoomId,
        rating: parsedRating,
        comment: comment ? comment.trim() : null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error: any) {
    console.error('Feedback submit error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback: ' + error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendRsvpResponseEmail } from '@/lib/mail';

// GET: Update attendee status
// E.g., http://localhost:3000/api/rsvp?bookingId=5&email=harshithyadav.ittaboina@gmail.com&status=Accepted
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingIdStr = searchParams.get('bookingId');
    const email = searchParams.get('email');
    const status = searchParams.get('status'); // 'Accepted' | 'Declined'

    if (!bookingIdStr || !email || !status) {
      return new NextResponse('<h1>Invalid RSVP Request</h1><p>Missing parameters.</p>', {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    const bookingId = parseInt(bookingIdStr);
    if (isNaN(bookingId)) {
      return new NextResponse('<h1>Invalid RSVP Request</h1><p>Invalid booking ID format.</p>', {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (status !== 'Accepted' && status !== 'Declined') {
      return new NextResponse('<h1>Invalid RSVP Request</h1><p>Invalid status value.</p>', {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Find the attendee record
    const attendee = await prisma.attendee.findFirst({
      where: {
        bookingId,
        email: email.trim().toLowerCase()
      },
      include: {
        booking: {
          include: {
            room: true,
            user: true
          }
        }
      }
    });

    if (!attendee) {
      return new NextResponse('<h1>RSVP Failed</h1><p>No invitation found for this email address.</p>', {
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Update RSVP status
    await prisma.attendee.update({
      where: { id: attendee.id },
      data: { status }
    });

    // Write to audit trail
    await prisma.bookingHistory.create({
      data: {
        bookingId,
        action: `RSVP_${status}`,
        performedBy: email.trim().toLowerCase(),
      }
    });

    // Resolve attendee name if user exists in corporate database
    const attendeeUser = await prisma.user.findFirst({
      where: { email: email.trim().toLowerCase() }
    });
    const attendeeName = attendeeUser ? attendeeUser.name : email;

    // Send notification email to the organizer
    if (attendee.booking.user) {
      sendRsvpResponseEmail(
        attendee.booking.user.email,
        attendee.booking.user.name,
        email.trim().toLowerCase(),
        attendeeName,
        attendee.booking.room.name,
        attendee.booking.title,
        status as 'Accepted' | 'Declined'
      ).catch(e => console.error(`Failed to send RSVP email notification to organizer ${attendee.booking.user.email}:`, e));
    }

    const isAccepted = status === 'Accepted';
    const roomName = attendee.booking.room.name;
    const meetingTitle = attendee.booking.title;

    // Send a stylized response back to the user
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>RSVP Confirmed</title>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #f1f5f9; text-align: center; padding: 50px; }
            .card { background-color: #1e293b; max-width: 500px; margin: 0 auto; padding: 40px; border-radius: 16px; border: 1px solid #334155; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); }
            h1 { color: ${isAccepted ? '#10b981' : '#f43f5e'}; margin-bottom: 10px; font-size: 28px; }
            p { color: #94a3b8; line-height: 1.6; }
            .meta { margin-top: 20px; font-weight: bold; color: #cbd5e1; font-size: 16px; }
            .footer { margin-top: 40px; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>RSVP Recorded</h1>
            <p>You have successfully <strong>${status.toLowerCase()}</strong> the invitation for the meeting:</p>
            <p class="meta">"${meetingTitle}" @ ${roomName}</p>
            <p class="footer">Lumina Spatial Management Suite</p>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error: any) {
    return new NextResponse(`<h1>Internal Error</h1><p>${error.message}</p>`, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

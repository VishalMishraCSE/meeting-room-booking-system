import nodemailer from 'nodemailer';

// Create SMTP transport on demand using environment variables
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('⚠️ SMTP credentials not fully configured in environment variables. Emails will be logged to console.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for port 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
}

const fromAddress = process.env.SMTP_FROM || '"Lumina Reserve" <no-reply@lumina.com>';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  icalEvent?: {
    filename: string;
    method: string;
    content: string;
  };
}

// Core send function
export async function sendEmail({ to, subject, html, icalEvent }: MailOptions): Promise<boolean> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`\n=================== [SIMULATED EMAIL] ===================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (HTML preview):\n${html.replace(/<[^>]*>/g, '').trim().substring(0, 300)}...`);
    if (icalEvent) {
      console.log(`iCal Invite Included: ${icalEvent.filename}`);
    }
    console.log(`=========================================================\n`);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
      ...(icalEvent && { icalEvent }),
    });
    console.log(`📧 Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    return false;
  }
}

// Helper to format ISO date string for iCal and Google Calendar
function formatCalendarDate(date: Date): string {
  // Remove milliseconds, hyphens and colons
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Helper to create ICS Content
function createIcsContent(
  title: string,
  startTime: Date,
  endTime: Date,
  location: string,
  uid: string,
  sequence: number = 0,
  status: string = 'CONFIRMED',
  method: string = 'REQUEST'
): string {
  const dtStart = formatCalendarDate(startTime);
  const dtEnd = formatCalendarDate(endTime);
  const dtStamp = formatCalendarDate(new Date());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lumina Reserve//Spatial Management Suite//EN',
    'CALSCALE:GREGORIAN',
    `METHOD:${method}`,
    'BEGIN:VEVENT',
    `UID:${uid}@lumina.com`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    'DESCRIPTION:Lumina Reserve Facility Reservation Invite',
    `LOCATION:${location}`,
    `STATUS:${status}`,
    `SEQUENCE:${sequence}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

// 1. Employee Booking Confirmation HTML Template
export async function sendBookingConfirmationEmail(
  bookingId: number,
  employeeEmail: string,
  employeeName: string,
  roomName: string,
  location: string,
  startTime: Date,
  endTime: Date,
  title: string
) {
  const formattedDate = startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const startStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Generate Google Calendar Link
  const gcalStart = formatCalendarDate(startTime);
  const gcalEnd = formatCalendarDate(endTime);
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${gcalStart}/${gcalEnd}&details=${encodeURIComponent('Lumina Reserve Meeting Room booking confirmation.')}&location=${encodeURIComponent(`${roomName} (${location})`)}`;

  // Generate standard iCal content using deterministic UID
  const uid = `booking-${bookingId}`;
  const icsContent = createIcsContent(
    title,
    startTime,
    endTime,
    `${roomName} (${location})`,
    uid,
    0,
    'CONFIRMED',
    'REQUEST'
  );

  const html = `
    <div style="font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
      <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 5px; border-bottom: 2px solid #334155; padding-bottom: 10px;">Lumina Reserve</h1>
      <p style="font-size: 16px; margin-top: 20px;">Hello <strong>${employeeName}</strong>,</p>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
        Your meeting reservation has been successfully scheduled and confirmed.
      </p>
      <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #334155;">
        <h3 style="color: #6366f1; margin-top: 0; font-size: 18px;">${title}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #64748b; padding: 5px 0; width: 120px;">Room:</td>
            <td style="color: #f8fafc; font-weight: bold;">${roomName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Location:</td>
            <td style="color: #cbd5e1;">${location}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Date:</td>
            <td style="color: #cbd5e1;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Time:</td>
            <td style="color: #cbd5e1;">${startStr} - ${endStr}</td>
          </tr>
        </table>
      </div>
      
      <!-- Premium Calendar Action Button -->
      <div style="text-align: center; margin: 25px 0 15px 0;">
        <a href="${gcalUrl}" target="_blank" style="background-color: #6366f1; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);">
          📅 Add to Google Calendar
        </a>
      </div>
      
      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px;">
        Lumina Corporate Spatial Management Suite.
      </p>
    </div>
  `;

  return sendEmail({
    to: employeeEmail,
    subject: `Booking Confirmed: ${roomName} - ${formattedDate}`,
    html,
    icalEvent: {
      filename: 'invite.ics',
      method: 'REQUEST',
      content: icsContent,
    },
  });
}

// 2. Manager Pending Approval Request HTML Template
export async function sendApprovalRequestEmail(
  managerEmail: string,
  managerName: string,
  employeeName: string,
  roomName: string,
  location: string,
  startTime: Date,
  endTime: Date,
  title: string
) {
  const formattedDate = startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const startStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const html = `
    <div style="font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #ef4444;">
      <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 5px; border-bottom: 2px solid #334155; padding-bottom: 10px;">Lumina Reserve</h1>
      <p style="font-size: 16px; margin-top: 20px;">Hello <strong>${managerName}</strong>,</p>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
        A new facility reservation requires your manager approval.
      </p>
      <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #ef4444/30;">
        <h3 style="color: #f8fafc; margin-top: 0; font-size: 18px;">${title}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #64748b; padding: 5px 0; width: 120px;">Requested By:</td>
            <td style="color: #f8fafc; font-weight: bold;">${employeeName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Room:</td>
            <td style="color: #f8fafc;">${roomName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Schedule:</td>
            <td style="color: #cbd5e1;">${formattedDate} • ${startStr} - ${endStr}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 14px; line-height: 1.6;">
        Please log into the <a href="http://localhost:3000/manager" style="color: #ef4444; text-decoration: underline;">Lumina Approval Suite</a> to confirm or decline this request.
      </p>
      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px;">
        Lumina Corporate Spatial Management Suite.
      </p>
    </div>
  `;

  return sendEmail({
    to: managerEmail,
    subject: `Approval Required: ${employeeName} - ${roomName}`,
    html,
  });
}

// 3. Admin Maintenance Alert HTML Template
export async function sendMaintenanceAlertEmail(
  adminEmail: string,
  adminName: string,
  roomName: string,
  roomNumber: string,
  status: string
) {
  const html = `
    <div style="font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #f59e0b;">
      <h1 style="color: #f59e0b; font-size: 24px; margin-bottom: 5px; border-bottom: 2px solid #334155; padding-bottom: 10px;">Lumina Systems Admin</h1>
      <p style="font-size: 16px; margin-top: 20px;">Hello <strong>${adminName}</strong>,</p>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
        A facility status change has been executed.
      </p>
      <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #f59e0b/30;">
        <h3 style="color: #f8fafc; margin-top: 0; font-size: 18px;">Status Alert: ${roomName}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #64748b; padding: 5px 0; width: 120px;">Room Number:</td>
            <td style="color: #f8fafc;">${roomNumber}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">New Status:</td>
            <td style="color: ${status === 'Maintenance' ? '#f59e0b' : '#10b981'}; font-weight: bold;">${status}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px;">
        Lumina Corporate Spatial Management Suite.
      </p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `System Alert: ${roomName} status changed to ${status}`,
    html,
  });
}

// 4. Employee/Attendee Cancellation Email HTML Template with iCal Cancellation attachment
export async function sendBookingCancellationEmail(
  bookingId: number,
  email: string,
  name: string,
  roomName: string,
  location: string,
  startTime: Date,
  endTime: Date,
  title: string,
  reason: string = 'preempted by an administrator or cancelled by organizer'
) {
  const formattedDate = startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const startStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Generate calendar cancellation format
  const uid = `booking-${bookingId}`;
  const icsContent = createIcsContent(
    title,
    startTime,
    endTime,
    `${roomName} (${location})`,
    uid,
    1,
    'CANCELLED',
    'CANCEL'
  );

  const html = `
    <div style="font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #f43f5e;">
      <h1 style="color: #f43f5e; font-size: 24px; margin-bottom: 5px; border-bottom: 2px solid #334155; padding-bottom: 10px;">Lumina Reserve</h1>
      <p style="font-size: 16px; margin-top: 20px;">Hello <strong>${name}</strong>,</p>
      <p style="font-size: 14px; color: #f43f5e; line-height: 1.6; font-weight: bold;">
        ⚠️ Reservation Cancelled Alert
      </p>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
        Your meeting reservation has been cancelled. Reason: <strong>${reason}</strong>.
      </p>
      <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #f43f5e/20;">
        <h3 style="color: #94a3b8; margin-top: 0; font-size: 18px; text-decoration: line-through;">${title}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #64748b; padding: 5px 0; width: 120px;">Room:</td>
            <td style="color: #94a3b8; text-decoration: line-through;">${roomName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Location:</td>
            <td style="color: #cbd5e1;">${location}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Date:</td>
            <td style="color: #cbd5e1;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Time:</td>
            <td style="color: #cbd5e1;">${startStr} - ${endStr}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px;">
        Lumina Corporate Spatial Management Suite.
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Cancelled: Reservation for ${roomName} - ${formattedDate}`,
    html,
    icalEvent: {
      filename: 'cancel.ics',
      method: 'CANCEL',
      content: icsContent,
    },
  });
}

// 5. Booking Rejection Email HTML Template
export async function sendBookingRejectionEmail(
  employeeEmail: string,
  employeeName: string,
  roomName: string,
  location: string,
  startTime: Date,
  endTime: Date,
  title: string,
  reason: string
) {
  const formattedDate = startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const startStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const html = `
    <div style="font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #ef4444;">
      <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 5px; border-bottom: 2px solid #334155; padding-bottom: 10px;">Lumina Reserve</h1>
      <p style="font-size: 16px; margin-top: 20px;">Hello <strong>${employeeName}</strong>,</p>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
        Unfortunately, your pending reservation request for <strong>${roomName}</strong> has been declined.
      </p>
      <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #ef4444/30;">
        <h3 style="color: #cbd5e1; margin-top: 0; font-size: 18px; text-decoration: line-through;">${title}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #64748b; padding: 5px 0; width: 120px;">Room:</td>
            <td style="color: #cbd5e1;">${roomName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Location:</td>
            <td style="color: #cbd5e1;">${location}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Schedule:</td>
            <td style="color: #cbd5e1;">${formattedDate} • ${startStr} - ${endStr}</td>
          </tr>
          <tr>
            <td style="color: #ef4444; padding: 5px 0; font-weight: bold;">Declined Reason:</td>
            <td style="color: #fca5a5; font-weight: bold;">${reason}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px;">
        Lumina Corporate Spatial Management Suite.
      </p>
    </div>
  `;

  return sendEmail({
    to: employeeEmail,
    subject: `Reservation Declined: ${roomName} - ${formattedDate}`,
    html,
  });
}

// 6. Booking Update Notification HTML Template with updated iCal
export async function sendBookingUpdateEmail(
  bookingId: number,
  employeeEmail: string,
  employeeName: string,
  roomName: string,
  location: string,
  startTime: Date,
  endTime: Date,
  title: string,
  sequence: number = 1
) {
  const formattedDate = startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const startStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Generate Google Calendar Link
  const gcalStart = formatCalendarDate(startTime);
  const gcalEnd = formatCalendarDate(endTime);
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${gcalStart}/${gcalEnd}&details=${encodeURIComponent('Updated Lumina Reserve booking.')}&location=${encodeURIComponent(`${roomName} (${location})`)}`;

  const uid = `booking-${bookingId}`;
  const icsContent = createIcsContent(
    title,
    startTime,
    endTime,
    `${roomName} (${location})`,
    uid,
    sequence,
    'CONFIRMED',
    'REQUEST'
  );

  const html = `
    <div style="font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #3b82f6;">
      <h1 style="color: #3b82f6; font-size: 24px; margin-bottom: 5px; border-bottom: 2px solid #334155; padding-bottom: 10px;">Lumina Reserve</h1>
      <p style="font-size: 16px; margin-top: 20px;">Hello <strong>${employeeName}</strong>,</p>
      <p style="font-size: 14px; color: #3b82f6; line-height: 1.6; font-weight: bold;">
        ✏️ Reservation Details Updated
      </p>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
        The details for your scheduled meeting have been updated. Please verify the new schedule below.
      </p>
      <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #3b82f6/30;">
        <h3 style="color: #3b82f6; margin-top: 0; font-size: 18px;">${title}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #64748b; padding: 5px 0; width: 120px;">Room:</td>
            <td style="color: #f8fafc; font-weight: bold;">${roomName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Location:</td>
            <td style="color: #cbd5e1;">${location}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Date:</td>
            <td style="color: #cbd5e1;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Time:</td>
            <td style="color: #cbd5e1;">${startStr} - ${endStr}</td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; margin: 25px 0 15px 0;">
        <a href="${gcalUrl}" target="_blank" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);">
          📅 Update Google Calendar
        </a>
      </div>
      
      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px;">
        Lumina Corporate Spatial Management Suite.
      </p>
    </div>
  `;

  return sendEmail({
    to: employeeEmail,
    subject: `Updated: Reservation for ${roomName} - ${formattedDate}`,
    html,
    icalEvent: {
      filename: 'invite.ics',
      method: 'REQUEST',
      content: icsContent,
    },
  });
}

// 7. No-Show Auto-Release Alert HTML Template
export async function sendNoShowReleaseEmail(
  employeeEmail: string,
  employeeName: string,
  roomName: string,
  location: string,
  startTime: Date,
  endTime: Date,
  title: string
) {
  const formattedDate = startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const startStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endStr = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const html = `
    <div style="font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #f59e0b;">
      <h1 style="color: #f59e0b; font-size: 24px; margin-bottom: 5px; border-bottom: 2px solid #334155; padding-bottom: 10px;">Lumina Reserve</h1>
      <p style="font-size: 16px; margin-top: 20px;">Hello <strong>${employeeName}</strong>,</p>
      <p style="font-size: 14px; color: #f59e0b; line-height: 1.6; font-weight: bold;">
        ⚠️ Auto-Release Alert: No Show
      </p>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
        Your reservation has been auto-released because check-in was not completed within the required 15-minute buffer.
      </p>
      <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #f59e0b/20;">
        <h3 style="color: #94a3b8; margin-top: 0; font-size: 18px; text-decoration: line-through;">${title}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #64748b; padding: 5px 0; width: 120px;">Released Room:</td>
            <td style="color: #cbd5e1;">${roomName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Location:</td>
            <td style="color: #cbd5e1;">${location}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Originally Scheduled:</td>
            <td style="color: #cbd5e1;">${formattedDate} • ${startStr} - ${endStr}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px;">
        Lumina Corporate Spatial Management Suite.
      </p>
    </div>
  `;

  return sendEmail({
    to: employeeEmail,
    subject: `Released (No-Show): Reservation for ${roomName} - ${formattedDate}`,
    html,
  });
}

// 8. Attendee RSVP Response Alert HTML Template
export async function sendRsvpResponseEmail(
  organizerEmail: string,
  organizerName: string,
  attendeeEmail: string,
  attendeeName: string,
  roomName: string,
  meetingTitle: string,
  status: 'Accepted' | 'Declined'
) {
  const isAccepted = status === 'Accepted';
  const html = `
    <div style="font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid ${isAccepted ? '#10b981' : '#f43f5e'};">
      <h1 style="color: #6366f1; font-size: 24px; margin-bottom: 5px; border-bottom: 2px solid #334155; padding-bottom: 10px;">Lumina Reserve</h1>
      <p style="font-size: 16px; margin-top: 20px;">Hello <strong>${organizerName}</strong>,</p>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
        An attendee has responded to your meeting invitation.
      </p>
      <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid ${isAccepted ? '#10b981/30' : '#f43f5e/30'};">
        <h3 style="color: #cbd5e1; margin-top: 0; font-size: 18px;">${meetingTitle}</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #64748b; padding: 5px 0; width: 120px;">Attendee:</td>
            <td style="color: #f8fafc; font-weight: bold;">${attendeeName} (${attendeeEmail})</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">Room:</td>
            <td style="color: #cbd5e1;">${roomName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 5px 0;">RSVP Status:</td>
            <td style="color: ${isAccepted ? '#10b981' : '#f43f5e'}; font-weight: bold;">${status}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px;">
        Lumina Corporate Spatial Management Suite.
      </p>
    </div>
  `;

  return sendEmail({
    to: organizerEmail,
    subject: `RSVP Response: ${attendeeName} has ${status.toLowerCase()} "${meetingTitle}"`,
    html,
  });
}



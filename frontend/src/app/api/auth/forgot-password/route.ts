import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mail';
import { saveRecoveryOtp } from '@/lib/recoveryStore';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Corporate email address is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists in the database
    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this corporate email address.' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'This corporate account is currently deactivated. Please contact your IT administrator.' },
        { status: 403 }
      );
    }

    // Generate random 6-digit security OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    saveRecoveryOtp(normalizedEmail, otp);

    // Build professional Payswiff branded security email
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; background-color: #0b0f19; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
            <span style="color: #ffffff;">pay</span><span style="color: #e8292b;">swiff</span> <span style="font-size: 13px; color: #f15b2d; font-weight: 700; border: 1px solid #f15b2d; padding: 2px 8px; border-radius: 6px; margin-left: 6px; text-transform: uppercase;">RECOVERY</span>
          </h2>
          <p style="margin-top: 6px; font-size: 12px; color: #94a3b8;">Corporate Spatial Management System</p>
        </div>

        <div style="background-color: #111827; border-radius: 12px; padding: 24px; border: 1px solid #1f2937; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #f8fafc; font-size: 16px; font-weight: 700;">Account Recovery Security Code</h3>
          <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 18px;">
            Hello <strong style="color: #ffffff;">${user.name}</strong>,<br/>
            A request was received to reset your password or update your username for your PAYSWIFF MEETING ROOM account. Use the one-time security verification code below:
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #e8292b, #f15b2d); color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 8px; padding: 14px 28px; border-radius: 12px; box-shadow: 0 8px 24px rgba(232, 41, 43, 0.35); text-align: center;">
              ${otp}
            </div>
          </div>

          <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0;">
            ⏱️ This security code is valid for <strong style="color: #f15b2d;">10 minutes</strong>.
          </p>
        </div>

        <div style="font-size: 12px; color: #64748b; line-height: 1.5; padding: 0 8px;">
          <p style="margin: 0 0 8px 0;">
            <strong>Current Profile Details:</strong><br/>
            • Username / Name: <span style="color: #94a3b8;">${user.name}</span><br/>
            • Registered Email: <span style="color: #94a3b8;">${user.email}</span><br/>
            • Account Role: <span style="color: #94a3b8;">${user.role}</span>
          </p>
          <p style="margin: 12px 0 0 0; color: #475569;">
            If you did not request this security code, please ignore this email or contact your IT security team immediately.
          </p>
        </div>
      </div>
    `;

    const emailSent = await sendEmail({
      to: normalizedEmail,
      subject: `PAYSWIFF MEETING ROOM | Security Code: ${otp}`,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'A 6-digit security code has been sent to your email.',
      currentName: user.name,
      emailSent,
    });
  } catch (error: any) {
    console.error('Error in forgot-password:', error);
    return NextResponse.json(
      { error: 'Failed to process security code request: ' + error.message },
      { status: 500 }
    );
  }
}

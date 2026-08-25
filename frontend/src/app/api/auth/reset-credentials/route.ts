import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/mail';
import { verifyRecoveryOtp, clearRecoveryOtp } from '@/lib/recoveryStore';

export async function POST(request: Request) {
  try {
    const { email, otp, newName, newPassword } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and 6-digit security code are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify OTP code
    const verification = verifyRecoveryOtp(normalizedEmail, otp);
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.reason || 'Invalid security code.' },
        { status: 400 }
      );
    }

    if (!newName && !newPassword) {
      return NextResponse.json(
        { error: 'Please provide a new username or new password to update.' },
        { status: 400 }
      );
    }

    if (newPassword && newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User account not found.' },
        { status: 404 }
      );
    }

    const updateData: { name?: string; passwordHash?: string } = {};

    if (newName && newName.trim()) {
      updateData.name = newName.trim();
    }

    if (newPassword && newPassword.trim()) {
      updateData.passwordHash = bcrypt.hashSync(newPassword.trim(), 10);
    }

    // Update in MySQL database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Clear the OTP store for this user
    clearRecoveryOtp(normalizedEmail);

    // Send confirmation email
    const changesMade: string[] = [];
    if (updateData.name) changesMade.push(`Username changed to: <strong>${updatedUser.name}</strong>`);
    if (updateData.passwordHash) changesMade.push(`Password was successfully reset`);

    const confirmationHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px; background-color: #0b0f19; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">
            <span style="color: #ffffff;">pay</span><span style="color: #e8292b;">swiff</span>
          </h2>
          <p style="margin-top: 6px; font-size: 12px; color: #94a3b8;">Corporate Spatial Management System</p>
        </div>

        <div style="background-color: #111827; border-radius: 12px; padding: 24px; border: 1px solid #1f2937; margin-bottom: 20px;">
          <div style="color: #10b981; font-size: 18px; font-weight: 700; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            ✅ Security Credentials Updated Successfully
          </div>
          <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
            Hello <strong>${updatedUser.name}</strong>,<br/>
            Your Payswiff account credentials have been updated:
          </p>
          <ul style="color: #f8fafc; font-size: 13px; padding-left: 20px; line-height: 1.8;">
            ${changesMade.map((c) => `<li>${c}</li>`).join('')}
          </ul>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 16px;">
            You can now sign in using your updated credentials.
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: normalizedEmail,
      subject: 'PAYSWIFF MEETING ROOM | Credentials Updated Successfully',
      html: confirmationHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Your account credentials have been updated successfully! Please sign in.',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role.toLowerCase(),
      },
    });
  } catch (error: any) {
    console.error('Error in reset-credentials:', error);
    return NextResponse.json(
      { error: 'Failed to update credentials: ' + error.message },
      { status: 500 }
    );
  }
}

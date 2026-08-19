import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRecoveryOtp } from '@/lib/recoveryStore';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and 6-digit security code are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify OTP code against recovery store
    const verification = verifyRecoveryOtp(normalizedEmail, otp);
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.reason || 'Invalid security code.' },
        { status: 400 }
      );
    }

    // Lookup user to get name
    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User account not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Security code verified successfully.',
      currentName: user.name,
    });
  } catch (error: any) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json(
      { error: 'Failed to verify security code: ' + error.message },
      { status: 500 }
    );
  }
}

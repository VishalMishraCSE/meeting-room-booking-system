import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return NextResponse.json(
        { error: 'Invalid corporate credentials' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      if (user.role.toLowerCase() === 'manager') {
        return NextResponse.json(
          { error: 'Your Manager account is currently pending SysAdmin verification. You will receive an email once activated.' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: 'This corporate account has been deactivated or is awaiting administrative authorization' },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
      },
    });

    // Set user session cookie securely
    response.cookies.set('userSession', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      isActive: user.isActive,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Allow cross-device and LAN navigation
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

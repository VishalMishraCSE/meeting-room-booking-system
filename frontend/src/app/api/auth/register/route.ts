import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getLeastLoadedManagerId } from '@/lib/managerAssignment';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this corporate email already exists. Please sign in.' },
        { status: 400 }
      );
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const normalizedRole = role && ['Admin', 'Manager', 'Employee'].includes(role) ? role : 'Employee';

    // If registering an employee, find the least loaded manager to assign equally
    let assignedManagerId: number | null = null;
    if (normalizedRole.toLowerCase() === 'employee') {
      assignedManagerId = await getLeastLoadedManagerId();
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: normalizedRole,
        managerId: assignedManagerId,
        isActive: true,
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
      },
    });

    response.cookies.set('userSession', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      isActive: user.isActive,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Registration failed: ' + error.message },
      { status: 500 }
    );
  }
}

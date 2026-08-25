import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/managers — Fetch all active managers with their subordinate counts
export async function GET() {
  try {
    const managers = await prisma.user.findMany({
      where: {
        role: 'Manager',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formattedManagers = managers.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      department: m.department?.name || 'General Operations',
      employeeCount: m._count.employees,
    }));

    return NextResponse.json({
      success: true,
      managers: formattedManagers,
    });
  } catch (error: any) {
    console.error('Failed to fetch managers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch managers: ' + error.message },
      { status: 500 }
    );
  }
}

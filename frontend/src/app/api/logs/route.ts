import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

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

// GET: Fetch all audit log records (Admins & Managers only)
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      return NextResponse.json({ error: 'Access denied: Insufficient permissions' }, { status: 403 });
    }

    const histories = await prisma.bookingHistory.findMany({
      include: {
        booking: {
          include: {
            room: true,
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 100, // Limit to recent 100 logs for efficiency
    });

    // Format logs dynamically to match UI expectation
    const formattedLogs = histories.map((log: any) => ({
      id: `LOG-${log.id}`,
      title: `${log.booking.room.name} booking ${log.action.toLowerCase()}`,
      description: `Action performed by ${log.performedBy} on reservation '${log.booking.title}'`,
      time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      code: log.action === 'Preempted' ? 'ADM-OVR' : log.action === 'Cancelled' ? 'SYS-CANCEL' : 'SYS-OP',
      icon: log.action === 'Preempted' ? 'gavel' : log.action === 'Cancelled' ? 'delete' : 'info',
      iconColor: log.action === 'Preempted' ? 'text-error' : log.action === 'Cancelled' ? 'text-secondary' : 'text-primary'
    }));

    return NextResponse.json(formattedLogs);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch audit logs: ' + error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function checkManagerOrAdminAccess() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('userSession');
  if (!sessionCookie || !sessionCookie.value) {
    return { authorized: false, error: 'Unauthorized session' };
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    const role = (session.role || '').toLowerCase();
    if (role !== 'manager' && role !== 'admin') {
      return { authorized: false, error: 'Forbidden: Access restricted to Manager and Admin roles only' };
    }
    return { authorized: true, user: session };
  } catch (err) {
    return { authorized: false, error: 'Invalid session payload' };
  }
}

export async function GET(request: Request) {
  const access = await checkManagerOrAdminAccess();
  if (!access.authorized) {
    return NextResponse.json({ error: access.error }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const roomIdStr = searchParams.get('roomId');

  try {
    const whereCondition = roomIdStr ? { roomId: parseInt(roomIdStr, 10) } : {};
    const supplies = await prisma.roomSupply.findMany({
      where: whereCondition,
      include: {
        room: {
          select: { id: true, name: true, roomNumber: true, location: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(supplies);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch room supplies: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const access = await checkManagerOrAdminAccess();
  if (!access.authorized) {
    return NextResponse.json({ error: access.error }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { roomId, itemName, quantity, status, notes } = body;

    if (!roomId || !itemName) {
      return NextResponse.json(
        { error: 'roomId and itemName are required fields' },
        { status: 400 }
      );
    }

    const supply = await prisma.roomSupply.create({
      data: {
        roomId: parseInt(roomId.toString(), 10),
        itemName: itemName.trim(),
        quantity: quantity ? parseInt(quantity.toString(), 10) : 1,
        status: status || 'Missing',
        notes: notes ? notes.trim() : null,
        reportedBy: access.user?.name || access.user?.email || 'Corporate Staff',
      },
      include: {
        room: {
          select: { id: true, name: true, roomNumber: true, location: true },
        },
      },
    });

    return NextResponse.json({ success: true, supply });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create supply record: ' + error.message },
      { status: 500 }
    );
  }
}

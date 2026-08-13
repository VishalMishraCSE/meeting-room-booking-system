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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await checkManagerOrAdminAccess();
  if (!access.authorized) {
    return NextResponse.json({ error: access.error }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const supplyId = parseInt(resolvedParams.id, 10);
    const body = await request.json();
    const { status, notes, quantity, itemName } = body;

    const existing = await prisma.roomSupply.findUnique({
      where: { id: supplyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Supply record not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.roomSupply.update({
      where: { id: supplyId },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes: notes ? notes.trim() : null } : {}),
        ...(quantity ? { quantity: parseInt(quantity.toString(), 10) } : {}),
        ...(itemName ? { itemName: itemName.trim() } : {}),
      },
      include: {
        room: {
          select: { id: true, name: true, roomNumber: true, location: true },
        },
      },
    });

    return NextResponse.json({ success: true, supply: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update supply record: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await checkManagerOrAdminAccess();
  if (!access.authorized) {
    return NextResponse.json({ error: access.error }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const supplyId = parseInt(resolvedParams.id, 10);

    const existing = await prisma.roomSupply.findUnique({
      where: { id: supplyId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Supply record not found' },
        { status: 404 }
      );
    }

    await prisma.roomSupply.delete({
      where: { id: supplyId },
    });

    return NextResponse.json({ success: true, message: 'Supply record deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete supply record: ' + error.message },
      { status: 500 }
    );
  }
}

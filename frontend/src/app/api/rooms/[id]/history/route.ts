import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roomId = parseInt(id, 10);
    if (isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Fetch all bookings for this specific room
    const bookings = await prisma.booking.findMany({
      where: { roomId },
      include: {
        user: { select: { name: true, email: true } },
        history: true,
      },
      orderBy: { startTime: "desc" },
    });

    // Format audit history items
    const historyList = bookings.map((b) => ({
      id: b.id,
      title: b.title,
      user: b.user.name,
      userEmail: b.user.email,
      date: b.startTime.toISOString().split("T")[0],
      startTime: b.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: b.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: b.status,
      createdAt: b.createdAt,
      logs: b.history,
    }));

    return NextResponse.json({
      room: {
        id: room.id,
        name: room.name,
        location: room.location,
        capacity: room.capacity,
        status: room.status,
      },
      history: historyList,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch room history" },
      { status: 500 }
    );
  }
}

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
    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role.toLowerCase(),
      isActive: parsed.isActive
    };
  } catch {
    return null;
  }
}

// 1. GET: Fetch all rooms (with nested floors and amenities)
export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        floor: true,
        amenities: {
          where: { isActive: true }
        },
        photos: true,
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(rooms);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch rooms: ' + error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Admin adds a new room
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied: Admin permissions required' }, { status: 403 });
    }

    const {
      name,
      roomNumber,
      capacity,
      floorId,
      location,
      description,
      status,
      heroImageUrl,
      amenities, // Array of strings e.g. ["Video Conf", "Whiteboard"]
    } = await request.json();

    if (!name || !roomNumber || !capacity || !floorId) {
      return NextResponse.json(
        { error: 'Fields: name, roomNumber, capacity, and floorId are required' },
        { status: 400 }
      );
    }

    // Verify room number uniqueness
    const existing = await prisma.room.findUnique({
      where: { roomNumber },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Room number ${roomNumber} is already allocated` },
        { status: 400 }
      );
    }

    // Map amenities to include proper material icons
    const mappedAmenities = Array.isArray(amenities)
      ? amenities.map((amenityName: string) => {
          let icon = 'info';
          if (amenityName === 'Video Conf') icon = 'videocam';
          else if (amenityName === 'Whiteboard') icon = 'desktop_windows';
          else if (amenityName === 'Projector') icon = 'cast';
          else if (amenityName === 'TV') icon = 'tv';
          return { name: amenityName, icon };
        })
      : [];

    let targetFloorId = parseInt(floorId);

    // Verify if floor exists
    const floorExists = await prisma.floor.findUnique({
      where: { id: targetFloorId },
    });

    if (!floorExists) {
      // Try to match floor name from the location string (e.g. "floor 3" -> "Floor 3")
      let matchedFloor = null;
      if (location) {
        const locationLower = location.toLowerCase();
        const floors = await prisma.floor.findMany();
        matchedFloor = floors.find(f => locationLower.includes(f.name.toLowerCase()));
      }

      if (matchedFloor) {
        targetFloorId = matchedFloor.id;
      } else {
        // Fallback: Find the first floor in the database
        const firstFloor = await prisma.floor.findFirst();
        if (firstFloor) {
          targetFloorId = firstFloor.id;
        } else {
          // If absolutely no floors exist, create a default Floor to satisfy constraint
          const defaultFloor = await prisma.floor.create({
            data: { name: 'Floor 1', building: 'Main Block' },
          });
          targetFloorId = defaultFloor.id;
        }
      }
    }

    const newRoom = await prisma.room.create({
      data: {
        name,
        roomNumber,
        capacity: parseInt(capacity),
        floorId: targetFloorId,
        location,
        description,
        status: status || 'Available',
        heroImageUrl,
        amenities: {
          create: mappedAmenities,
        },
      },
      include: {
        floor: true,
        amenities: true,
      },
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create room: ' + error.message },
      { status: 500 }
    );
  }
}

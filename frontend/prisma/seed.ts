import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records to prevent unique constraint failures
  console.log('🧹 Cleaning existing records...');
  await prisma.favorite.deleteMany();
  await prisma.bookingHistory.deleteMany();
  await prisma.attendee.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.roomPhoto.deleteMany();
  await prisma.roomAmenity.deleteMany();
  await prisma.room.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // 2. Create Departments
  console.log('🏢 Seeding departments...');
  const engineering = await prisma.department.create({
    data: { name: 'Engineering', bookingQuota: 10 },
  });
  const operations = await prisma.department.create({
    data: { name: 'Operations', bookingQuota: 5 },
  });
  const design = await prisma.department.create({
    data: { name: 'Design', bookingQuota: 8 },
  });
  const hr = await prisma.department.create({
    data: { name: 'Human Resources', bookingQuota: 5 },
  });

  // 3. Create Floors
  console.log('🧱 Seeding floors...');
  const floor2 = await prisma.floor.create({
    data: { name: 'Floor 2', building: 'West Wing' },
  });
  const floor3 = await prisma.floor.create({
    data: { name: 'Floor 3', building: 'East Wing' },
  });
  const floor4 = await prisma.floor.create({
    data: { name: 'Floor 4', building: 'Main Building' },
  });
  const floor5 = await prisma.floor.create({
    data: { name: 'Floor 5', building: 'South Wing' },
  });

  // 4. Create Users (with hashed passwords)
  console.log('👤 Seeding corporate users...');
  const defaultPassword = bcrypt.hashSync('password123', 10);

  // Admin users
  const adminEmails = [
    { email: 'vishalmishra.csm@gmail.com', name: 'Vishal Mishra (Admin)' },
    { email: 'vishalcmrec@gmail.com', name: 'Vishal CMREC (Admin)' },
  ];

  // Manager users
  const managerEmails = [
    { email: 'saimalavikayadav@gmail.com', name: 'Malavika Yadav (Manager)' },
    { email: 'malavika29yadav@gmail.com', name: 'Malavika 29 (Manager)' },
    { email: 'rithika1101@gmail.com', name: 'Rithika (Manager)' },
  ];

  // Employee users
  const employeeEmails = [
    { email: 'Harshithyadav.ittaboina@gmail.com', name: 'Harshith Yadav' },
    { email: 'yadavharshith204@gmail.com', name: 'Harshith 204' },
    { email: '238r1a6623@gmail.com', name: 'Employee 623' },
    { email: '238r1a6623@cmrec.ac.in', name: 'Employee 623 (CMREC)' },
    { email: '238r1a6625@gmail.com', name: 'Employee 625' },
    { email: '238r1a6625@cmrec.ac.in', name: 'Employee 625 (CMREC)' },
    { email: 'joshita164@gmail.com', name: 'Joshita' },
    { email: '238r1a6663@gmail.com', name: 'Employee 663' },
    { email: '238r1a6663@cmrec.ac.in', name: 'Employee 663 (CMREC)' },
  ];

  const admins = [];
  for (const item of adminEmails) {
    const user = await prisma.user.create({
      data: {
        name: item.name,
        email: item.email.toLowerCase().trim(),
        passwordHash: defaultPassword,
        role: 'Admin',
        departmentId: operations.id,
      },
    });
    admins.push(user);
  }

  const managers = [];
  for (const item of managerEmails) {
    const user = await prisma.user.create({
      data: {
        name: item.name,
        email: item.email.toLowerCase().trim(),
        passwordHash: defaultPassword,
        role: 'Manager',
        departmentId: operations.id,
      },
    });
    managers.push(user);
  }

  const employees = [];
  for (const item of employeeEmails) {
    const user = await prisma.user.create({
      data: {
        name: item.name,
        email: item.email.toLowerCase().trim(),
        passwordHash: defaultPassword,
        role: 'Employee',
        departmentId: engineering.id,
      },
    });
    employees.push(user);
  }

  // 5. Create Rooms and their Amenities
  console.log('🚪 Seeding meeting rooms & amenities...');

  // Alpha Boardroom
  const alphaBoardroom = await prisma.room.create({
    data: {
      name: 'Alpha Boardroom',
      roomNumber: '401',
      capacity: 24,
      floorId: floor4.id,
      location: 'Floor 4, North Wing',
      description: 'Executive boardroom equipped with state-of-the-art teleconferencing systems.',
      status: 'Available',
      heroImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0ol9PjeXi3Bj3rAKPRtdaOebaW7NNioctjsaVdX7XXDHcMPx_svn61gM1PJ1wPz0vjXKD-7D32w1RqCmMAgFgjllRLV_pvza_syZEMmDr8tWlPrugEnX9HPNiW0sdQVM_vBa721IlOrSEhBuukuN_P4KVfOALIBSmdY35kvwa5DKMRp-hGSkB1TIecPWpbFI4SEdbSXOcWqrXKF4EgJNlPenEWkuFyLvvAkKwMBL0odzWpyM_UmkdnlnJuk8zQmv6CZsY1JLg26Nm',
      avgRating: 4.8,
      amenities: {
        create: [
          { name: 'Video Conf', icon: 'videocam' },
          { name: 'Whiteboard', icon: 'desktop_windows' },
          { name: 'Projector', icon: 'cast' },
        ],
      },
    },
  });

  // Beta Lab
  const betaLab = await prisma.room.create({
    data: {
      name: 'Beta Lab',
      roomNumber: '402',
      capacity: 12,
      floorId: floor4.id,
      location: 'Floor 4, East Wing',
      description: 'Collaborative development space and testing environment.',
      status: 'Maintenance',
      heroImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmiAyfyc6MokYdRyOd9u11Ozjsl8e4bHGpUuQPTX_3whwNs35wgOOxpJcYxT2HK-tpwrVB3RFPMksfUlu0qsbpIfWCSKn3HdhIF_fdpvJFJxe_IDtNswB2BTRGN17IABhBtwyXPYiq4Z_ggChHTxjBWgiYble_1xZVpbd6SGWA4UFAQ5WiPjLKqrMJx4nJ6OKhIcz7OIFqJchasDT5113SaxI_sE4SrGRWRqe0SSje7iT3IiVFtlR8xs43rV5WtT-gYaFLOFSDgvx-',
      avgRating: 4.2,
      amenities: {
        create: [
          { name: 'Video Conf', icon: 'videocam' },
          { name: 'TV', icon: 'tv' },
        ],
      },
    },
  });

  // Studio C
  const studioC = await prisma.room.create({
    data: {
      name: 'Studio C',
      roomNumber: '501',
      capacity: 4,
      floorId: floor5.id,
      location: 'Floor 5, South Wing',
      description: 'Compact focus room for quick syncs and quiet work sessions.',
      status: 'Available',
      heroImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFGHdHc3tTydeu1GdafZl4LlA9vHBRrBLuCCSi0jE8Y9Bg8eHgyAUcmjBzxoHCxDEKj8h2T2tue6xTpMGGIRqZyEOrizAXjJKS9g7Gn4TawU13VgqDH_HAcT1yZ2z2uodGRQMawisGkZMCFmJReN8Sh4ZIcfchLZdJ8nGQmTbWXYldxwYn3vHhP52YUP4yNbtVasfxb0RPueaB68oqfzgsPgi2mLCQWvi6Wubnwr3aAjZuocPyMj8_Plw9B1ij7I8lPQUM4SFaB7Mm',
      avgRating: 4.5,
      amenities: {
        create: [
          { name: 'Whiteboard', icon: 'desktop_windows' },
        ],
      },
    },
  });

  // Helios Suite
  const heliosSuite = await prisma.room.create({
    data: {
      name: 'Helios Suite',
      roomNumber: '201',
      capacity: 8,
      floorId: floor2.id,
      location: 'Floor 2, West Wing',
      description: 'Mid-sized presentation space with vibrant lighting controls.',
      status: 'Available',
      heroImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
      avgRating: 4.6,
      amenities: {
        create: [
          { name: 'Video Conf', icon: 'videocam' },
          { name: 'Whiteboard', icon: 'desktop_windows' },
          { name: 'TV', icon: 'tv' },
        ],
      },
    },
  });

  // Prometheus Hall
  const prometheusHall = await prisma.room.create({
    data: {
      name: 'Prometheus Hall',
      roomNumber: '301',
      capacity: 16,
      floorId: floor3.id,
      location: 'Floor 3, East Wing',
      description: 'Spacious workshop room ideal for interactive training sessions.',
      status: 'Available',
      heroImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop',
      avgRating: 4.7,
      amenities: {
        create: [
          { name: 'Video Conf', icon: 'videocam' },
          { name: 'Whiteboard', icon: 'desktop_windows' },
          { name: 'Projector', icon: 'cast' },
          { name: 'TV', icon: 'tv' },
        ],
      },
    },
  });

  console.log('🎉 Seeding successfully completed without mock bookings!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

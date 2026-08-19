import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function checkAndReset() {
  console.log("Checking MySQL users...");
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users in database:`);

  const hash = bcrypt.hashSync('password123', 10);

  for (const u of users) {
    console.log(`- ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`);
  }

  await prisma.user.updateMany({
    data: {
      passwordHash: hash,
      isActive: true
    }
  });

  console.log("SUCCESS: All passwords in MySQL set to 'password123'!");
}

checkAndReset().catch(console.error).finally(() => prisma.$disconnect());

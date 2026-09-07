import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from './server/src/lib/prisma.js';

async function main() {
  const school = await prisma.school.create({
    data: { name: 'Test High School' },
  });

  const user = await prisma.user.create({
    data: {
      schoolId: school.id,
      name: 'Test Teacher',
      email: 'teacher@test.local',
      passwordHash: await bcrypt.hash('TestPassword123', 12),
      role: 'teacher',
      forcePwChange: false,
    },
  });

  console.log('School:', school.id);
  console.log('Login:', user.email, '/ TestPassword123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
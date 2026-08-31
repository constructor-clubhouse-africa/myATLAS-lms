import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma 7 requires a driver adapter. The connection string lives in .env,
// not in schema.prisma.
//
// Single shared client — do NOT instantiate PrismaClient per request,
// it opens a new connection pool every time.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

export default prisma;

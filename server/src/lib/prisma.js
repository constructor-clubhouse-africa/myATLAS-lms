import { PrismaClient } from '@prisma/client';

// Single shared client. Do NOT instantiate PrismaClient per request —
// it opens a new connection pool every time.
const prisma = new PrismaClient();

export default prisma;

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Pooled connection (Supabase pgbouncer, port 6543) — used by the app
    url: env('DATABASE_URL'),
    // Direct connection (port 5432) — REQUIRED by Prisma Migrate.
    // Migrations fail against pgbouncer.
    directUrl: env('DIRECT_URL'),
  },
});

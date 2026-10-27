import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // `prisma generate` (postinstall) avalia este arquivo sem conectar no banco,
    // então não pode exigir a env: num clone novo ainda não há .env.
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  },
});

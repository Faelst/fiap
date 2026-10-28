import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../src/generated/prisma/client';

const API_ROOT = join(__dirname, '..');
const DB = 'seed-policy.db';
const URL = `file:./${DB}`;
const PRISMA = join(API_ROOT, 'node_modules', '.bin', 'prisma');

function prismaCli(args: string[], extraEnv: Record<string, string> = {}) {
  return execFileSync(PRISMA, args, {
    cwd: API_ROOT,
    env: { ...process.env, DATABASE_URL: URL, SEED_RESET: '', ...extraEnv },
    encoding: 'utf8',
    stdio: 'pipe',
  });
}

function removeDb() {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    rmSync(join(API_ROOT, `${DB}${suffix}`), { force: true });
  }
}

// Banco próprio: o seed aqui não pode mexer nos ids do test.db das outras suítes.
describe('Seed em banco já populado (e2e)', () => {
  let prisma: PrismaClient;

  const guardianIds = async () =>
    (await prisma.guardian.findMany({ orderBy: { cpf: 'asc' } })).map(
      (g) => g.id,
    );

  beforeAll(() => {
    removeDb();
    prismaCli(['migrate', 'deploy']);
    prismaCli(['db', 'seed']);
    prisma = new PrismaClient({
      adapter: new PrismaBetterSqlite3({ url: URL }),
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    removeDb();
  });

  it('rodar de novo não apaga nem duplica: os ids continuam os mesmos', async () => {
    const before = await guardianIds();
    expect(before).toHaveLength(3);

    prismaCli(['db', 'seed']);

    expect(await guardianIds()).toEqual(before);
    expect(await prisma.student.count()).toBe(3);
  });

  it('com SEED_RESET=true apaga e recria (ids novos)', async () => {
    const before = await guardianIds();

    prismaCli(['db', 'seed'], { SEED_RESET: 'true' });

    const after = await guardianIds();
    expect(after).toHaveLength(3);
    expect(after.some((id) => before.includes(id))).toBe(false);
    expect(await prisma.student.count()).toBe(3);
  });
});

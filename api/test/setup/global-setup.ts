import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join } from 'node:path';

const API_ROOT = join(__dirname, '..', '..');
const TEST_DB_FILE = join(API_ROOT, 'test.db');

// O banco de teste é um arquivo descartável só da suíte e2e: é apagado e
// recriado com as migrations e o seed a cada execução.
export default function globalSetup(): void {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    rmSync(`${TEST_DB_FILE}${suffix}`, { force: true });
  }

  const env = { ...process.env, DATABASE_URL: 'file:./test.db' };
  const prisma = join(API_ROOT, 'node_modules', '.bin', 'prisma');

  execFileSync(prisma, ['migrate', 'deploy'], {
    cwd: API_ROOT,
    env,
    stdio: 'pipe',
  });
  execFileSync(prisma, ['db', 'seed'], { cwd: API_ROOT, env, stdio: 'pipe' });
}

import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { hash } from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';
import {
  GUARDIAN_WITHOUT_STUDENTS,
  mapSeed,
  RawGuardian,
  SeedStudent,
} from './seed-mapper';

const BCRYPT_ROUNDS = 10;

function readOfficialJson(): RawGuardian[] {
  const file = join(__dirname, 'seed-data', 'responsaveis.json');
  return JSON.parse(readFileSync(file, 'utf8')) as RawGuardian[];
}

function studentData(student: SeedStudent) {
  return {
    rm: student.rm,
    firstName: student.firstName,
    lastName: student.lastName,
    className: student.className,
    period: student.period,
    agendaDays: {
      create: student.agenda.map((day) => ({
        date: day.date,
        lessons: { create: day.lessons },
      })),
    },
    reportCards: {
      create: student.reportCards.map((card) => ({
        year: card.year,
        className: card.className,
        termResults: { create: card.termResults },
      })),
    },
  };
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL não definida.');
  }

  const { guardians, students } = mapSeed(readOfficialJson());
  const allGuardians = [...guardians, GUARDIAN_WITHOUT_STUDENTS];
  const passwordHashes = await Promise.all(
    allGuardians.map((guardian) => hash(guardian.password, BCRYPT_ROUNDS)),
  );

  const prisma = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url }),
  });

  try {
    await prisma.$transaction(async (tx) => {
      // Recria tudo: o seed pode rodar de novo sem duplicar nada.
      await tx.guardian.deleteMany();
      await tx.student.deleteMany();

      const studentIds = new Map<number, string>();
      for (const student of students) {
        const created = await tx.student.create({
          data: studentData(student),
          select: { id: true },
        });
        studentIds.set(student.rm, created.id);
      }

      for (const [index, guardian] of allGuardians.entries()) {
        await tx.guardian.create({
          data: {
            cpf: guardian.cpf,
            email: guardian.email,
            firstName: guardian.firstName,
            lastName: guardian.lastName,
            passwordHash: passwordHashes[index],
            students: {
              create: guardian.studentRms.map((rm) => ({
                studentId: studentIds.get(rm)!,
              })),
            },
          },
        });
      }
    });

    console.log(
      `Seed concluído: ${allGuardians.length} responsáveis e ${students.length} alunos.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

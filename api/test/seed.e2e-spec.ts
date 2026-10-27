import { PrismaService } from '../src/infra/prisma/prisma.service';
import { createTestApp } from './setup/create-test-app';
import { INestApplication } from '@nestjs/common';
import { compare } from 'bcryptjs';

describe('Seed no banco de teste (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('cria os 3 responsáveis, inclusive o sem aluno', async () => {
    const guardians = await prisma.guardian.findMany({
      orderBy: { cpf: 'asc' },
      select: {
        cpf: true,
        firstName: true,
        _count: { select: { students: true } },
      },
    });

    expect(guardians).toEqual([
      { cpf: '31415926590', firstName: 'Carlos', _count: { students: 0 } },
      { cpf: '50879567007', firstName: 'Adelaide', _count: { students: 1 } },
      { cpf: '96929456004', firstName: 'Gustavo', _count: { students: 2 } },
    ]);
  });

  it('guarda a senha com bcrypt, nunca em texto', async () => {
    const gustavo = await prisma.guardian.findUniqueOrThrow({
      where: { cpf: '96929456004' },
    });

    expect(gustavo.passwordHash).not.toBe('123456');
    expect(gustavo.passwordHash).toMatch(/^\$2[aby]\$/);
    await expect(compare('123456', gustavo.passwordHash)).resolves.toBe(true);
  });

  it('guarda as aulas com início, fim e a ordem do JSON', async () => {
    const day = await prisma.agendaDay.findFirstOrThrow({
      where: { date: '2025-03-17', student: { rm: 12567 } },
      include: { lessons: { orderBy: { order: 'asc' } } },
    });

    expect(day.lessons[0]).toMatchObject({
      startTime: '07:15',
      endTime: '08:00',
      subject: 'Matemática I',
      order: 0,
    });
    expect(day.lessons).toHaveLength(6);
  });

  it('guarda os dias sem aula da agenda', async () => {
    const days = await prisma.agendaDay.findMany({
      where: { student: { rm: 12567 } },
      orderBy: { date: 'asc' },
      include: { _count: { select: { lessons: true } } },
    });

    expect(days.map((d) => [d.date, d._count.lessons])).toEqual([
      ['2025-03-16', 0],
      ['2025-03-17', 6],
      ['2025-03-18', 6],
      ['2025-03-19', 6],
      ['2025-03-20', 6],
      ['2025-03-21', 6],
      ['2025-03-22', 0],
    ]);
  });

  it('guarda nota e falta null no T2 do Rafael em 2025', async () => {
    const results = await prisma.termResult.findMany({
      where: { term: 2, reportCard: { year: 2025, student: { rm: 12567 } } },
    });

    expect(results).toHaveLength(12);
    expect(results.every((r) => r.grade === null && r.absences === null)).toBe(
      true,
    );
  });
});

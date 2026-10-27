import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/infra/prisma/prisma.service';
import { createTestApp } from './setup/create-test-app';
import { loginAs } from './setup/auth-helpers';

const FORBIDDEN = {
  statusCode: 403,
  message: 'Você não tem acesso a este aluno.',
  error: 'Forbidden',
};

interface AgendaDayBody {
  date: string;
  lessons: Array<{ startTime: string; endTime: string; subject: string }>;
}

interface ReportCardBody {
  year: number;
  className: string;
  terms: Array<{
    term: number;
    subjects: Array<{
      name: string;
      grade: number | null;
      absences: number | null;
    }>;
  }>;
}

describe('Rotas por aluno (e2e)', () => {
  let app: INestApplication<App>;
  let gustavo: string;
  let adelaide: string;
  let carlos: string;
  const ids: Record<'rafael' | 'joana' | 'bianca', string> = {
    rafael: '',
    joana: '',
    bianca: '',
  };

  beforeAll(async () => {
    app = await createTestApp();
    const prisma = app.get(PrismaService);
    const studentId = async (rm: number) =>
      (await prisma.student.findUniqueOrThrow({ where: { rm } })).id;
    ids.rafael = await studentId(12567);
    ids.joana = await studentId(12568);
    ids.bianca = await studentId(13752);
    [gustavo, adelaide, carlos] = await Promise.all([
      loginAs(app, 'gustavo'),
      loginAs(app, 'adelaide'),
      loginAs(app, 'carlos'),
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  const get = (path: string, token?: string) => {
    const req = request(app.getHttpServer()).get(path);
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };

  describe('GET /api/students/:id/agenda', () => {
    it('200 com os 7 dias de 16 a 22/03/2025, em ordem de data', async () => {
      const response = await get(`/api/students/${ids.rafael}/agenda`, gustavo);

      expect(response.status).toBe(200);
      const agenda = response.body as AgendaDayBody[];
      expect(agenda.map((day) => day.date)).toEqual([
        '2025-03-16',
        '2025-03-17',
        '2025-03-18',
        '2025-03-19',
        '2025-03-20',
        '2025-03-21',
        '2025-03-22',
      ]);
    });

    it('domingo 16/03 e sábado 22/03 vêm com lessons: []', async () => {
      const response = await get(`/api/students/${ids.rafael}/agenda`, gustavo);
      const agenda = response.body as AgendaDayBody[];

      expect(agenda[0]).toEqual({ date: '2025-03-16', lessons: [] });
      expect(agenda[6]).toEqual({ date: '2025-03-22', lessons: [] });
    });

    it('17/03 começa às 07:15 com Matemática I e segue por startTime', async () => {
      const response = await get(`/api/students/${ids.rafael}/agenda`, gustavo);
      const monday = (response.body as AgendaDayBody[])[1];

      expect(monday.lessons[0]).toEqual({
        startTime: '07:15',
        endTime: '08:00',
        subject: 'Matemática I',
      });
      expect(monday.lessons).toHaveLength(6);
      const starts = monday.lessons.map((lesson) => lesson.startTime);
      expect(starts).toEqual(starts.toSorted());
    });

    it('200 para a Adelaide na agenda da Bianca', async () => {
      await get(`/api/students/${ids.bianca}/agenda`, adelaide).expect(200);
    });
  });

  describe('GET /api/students/:id/report-cards', () => {
    it('200 com os anos do Rafael, do mais recente', async () => {
      const response = await get(
        `/api/students/${ids.rafael}/report-cards`,
        gustavo,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { year: 2025, className: '7EF' },
        { year: 2024, className: '6EF' },
      ]);
    });

    it('200 com só 2025 para a Joana', async () => {
      const response = await get(
        `/api/students/${ids.joana}/report-cards`,
        gustavo,
      );

      expect(response.body).toEqual([{ year: 2025, className: '2EM' }]);
    });
  });

  describe('GET /api/students/:id/report-cards/:year', () => {
    it('200 com o Rafael em 2025: T1 com nota e falta nas 12 disciplinas, T2 e T3 null', async () => {
      const response = await get(
        `/api/students/${ids.rafael}/report-cards/2025`,
        gustavo,
      );

      expect(response.status).toBe(200);
      const card = response.body as ReportCardBody;
      expect(card.year).toBe(2025);
      expect(card.className).toBe('7EF');
      expect(card.terms.map((term) => term.term)).toEqual([1, 2, 3]);

      const [t1, t2, t3] = card.terms;
      expect(t1.subjects).toHaveLength(12);
      expect(t1.subjects[0]).toEqual({
        name: 'Língua Portuguesa',
        grade: 9.5,
        absences: 0,
      });
      for (const subject of t1.subjects) {
        expect(typeof subject.grade).toBe('number');
        expect(typeof subject.absences).toBe('number');
      }
      for (const term of [t2, t3]) {
        expect(term.subjects).toHaveLength(12);
        for (const subject of term.subjects) {
          expect(subject.grade).toBeNull();
          expect(subject.absences).toBeNull();
        }
      }
      // Mesma ordem de disciplinas nos três trimestres (ordem do JSON).
      const names = (index: number) =>
        card.terms[index].subjects.map((subject) => subject.name);
      expect(names(1)).toEqual(names(0));
      expect(names(2)).toEqual(names(0));
    });

    it('200 com o Rafael em 2024, turma 6EF', async () => {
      const response = await get(
        `/api/students/${ids.rafael}/report-cards/2024`,
        gustavo,
      );

      expect(response.status).toBe(200);
      expect((response.body as ReportCardBody).className).toBe('6EF');
    });

    it('404 com a Bianca em 2024 (ano sem boletim)', async () => {
      const response = await get(
        `/api/students/${ids.bianca}/report-cards/2024`,
        adelaide,
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        statusCode: 404,
        message: 'Boletim não encontrado.',
        error: 'Not Found',
      });
    });

    it.each([
      'abc',
      '2025.5',
      '-',
      '0x7E9',
      '0b11111101001',
      '2025.0',
      '%202025',
      '20e3',
      '+2025',
      '-2025',
      '02025',
      '999',
      '9223372036854775808',
    ])('400 com ano fora do formato de 4 dígitos ("%s")', async (year) => {
      const response = await get(
        `/api/students/${ids.rafael}/report-cards/${year}`,
        gustavo,
      );

      expect({ year, status: response.status }).toEqual({ year, status: 400 });
      expect(response.body).toEqual({
        statusCode: 400,
        message: 'Ano inválido: use 4 dígitos, ex.: 2025.',
        error: 'Bad Request',
      });
    });

    it('404 com ano de 4 dígitos sem boletim (0000 e 2023)', async () => {
      for (const year of ['0000', '2023']) {
        await get(
          `/api/students/${ids.rafael}/report-cards/${year}`,
          gustavo,
        ).expect(404);
      }
    });

    it('403 vem antes da validação do ano para aluno de outro responsável', async () => {
      for (const year of ['abc', '0x7E9']) {
        const response = await get(
          `/api/students/${ids.rafael}/report-cards/${year}`,
          adelaide,
        );

        expect({ year, status: response.status }).toEqual({
          year,
          status: 403,
        });
      }
    });
  });

  describe('ownership e autenticação', () => {
    const routes = (id: string) => [
      `/api/students/${id}/agenda`,
      `/api/students/${id}/report-cards`,
      `/api/students/${id}/report-cards/2025`,
    ];

    it('403 para a Adelaide nas três rotas do Rafael', async () => {
      for (const path of routes(ids.rafael)) {
        const response = await get(path, adelaide);
        expect({
          path,
          status: response.status,
          body: response.body as unknown,
        }).toEqual({
          path,
          status: 403,
          body: FORBIDDEN,
        });
      }
    });

    it('403 para o Carlos (sem aluno) nas rotas do Rafael', async () => {
      for (const path of routes(ids.rafael)) {
        await get(path, carlos).expect(403);
      }
    });

    it('403 com id inventado, com a mesma resposta do aluno de outro responsável', async () => {
      for (const path of routes('cl000000000000000000inventado')) {
        const response = await get(path, gustavo);
        expect({
          path,
          status: response.status,
          body: response.body as unknown,
        }).toEqual({
          path,
          status: 403,
          body: FORBIDDEN,
        });
      }
    });

    it('401 sem token nas três rotas', async () => {
      for (const path of routes(ids.rafael)) {
        await get(path).expect(401);
      }
    });

    it('401 com token válido de um responsável que não existe mais', async () => {
      const orphan = new JwtService({ secret: process.env.JWT_SECRET }).sign({
        sub: 'responsavel-apagado',
      });

      for (const path of routes(ids.rafael)) {
        await get(path, orphan).expect(401);
      }
    });
  });
});

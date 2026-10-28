import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/infra/prisma/prisma.service';
import { createTestApp } from './setup/create-test-app';
import { loginAs } from './setup/auth-helpers';

const ME = '/api/me';

interface MeBody {
  id: string;
  firstName: string;
  lastName: string;
  cpf: string;
  students: Array<Record<string, unknown>>;
}

describe('GET /api/me (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const getMe = (token: string) =>
    request(app.getHttpServer())
      .get(ME)
      .set('Authorization', `Bearer ${token}`);

  it('200 para o Gustavo: CPF mascarado e Rafael e Joana, na ordem do JSON', async () => {
    const response = await getMe(await loginAs(app, 'gustavo'));

    expect(response.status).toBe(200);
    const body = response.body as MeBody;
    expect(Object.keys(body).sort()).toEqual([
      'cpf',
      'firstName',
      'id',
      'lastName',
      'students',
    ]);
    expect(body).toMatchObject({
      firstName: 'Gustavo',
      lastName: 'da Silva',
      cpf: '***.294.560-**',
    });
    // Ordem do JSON oficial (e do Figma), não alfabética.
    expect((body.students[0] as { firstName: string }).firstName).toBe(
      'Rafael',
    );
    expect(body.students).toEqual([
      {
        id: expect.any(String) as string,
        rm: 12567,
        firstName: 'Rafael',
        lastName: 'da Silva',
        className: '7EF',
        period: 'Matutino',
      },
      {
        id: expect.any(String) as string,
        rm: 12568,
        firstName: 'Joana',
        lastName: 'da Silva',
        className: '2EM',
        period: 'Matutino',
      },
    ]);
    expect(JSON.stringify(body)).not.toContain('96929456004');
  });

  it('segue GuardianStudent.position, e não a ordem de inserção', async () => {
    const prisma = app.get(PrismaService);
    const gustavo = await prisma.guardian.findUniqueOrThrow({
      where: { cpf: '96929456004' },
      select: { id: true },
    });
    const setPosition = (rm: number, position: number) =>
      prisma.guardianStudent.updateMany({
        where: { guardianId: gustavo.id, student: { rm } },
        data: { position },
      });

    // Inverte o vínculo: Joana (12568) em 0, Rafael (12567) em 1.
    await setPosition(12568, 0);
    await setPosition(12567, 1);
    try {
      const response = await getMe(await loginAs(app, 'gustavo'));

      expect(response.status).toBe(200);
      expect(
        (response.body as MeBody).students.map((student) => student.firstName),
      ).toEqual(['Joana', 'Rafael']);
    } finally {
      await setPosition(12567, 0);
      await setPosition(12568, 1);
    }
  });

  it('200 para a Adelaide: só a Bianca', async () => {
    const response = await getMe(await loginAs(app, 'adelaide'));

    expect(response.status).toBe(200);
    const body = response.body as MeBody;
    expect(body.cpf).toBe('***.795.670-**');
    expect(body.students).toEqual([
      expect.objectContaining({ firstName: 'Bianca', rm: 13752 }),
    ]);
  });

  it('200 para o Carlos, sem aluno: students: []', async () => {
    const response = await getMe(await loginAs(app, 'carlos'));

    expect(response.status).toBe(200);
    expect((response.body as MeBody).students).toEqual([]);
  });

  it('401 sem token', async () => {
    await request(app.getHttpServer()).get(ME).expect(401);
  });

  it('401 com token inválido', async () => {
    await getMe('abc.def.ghi').expect(401);
  });

  it('401 com token válido de um responsável que não existe mais', async () => {
    const orphan = new JwtService({ secret: process.env.JWT_SECRET }).sign({
      sub: 'responsavel-apagado',
    });

    await getMe(orphan).expect(401);
  });
});

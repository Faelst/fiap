import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './setup/create-test-app';
import { ProtectedProbeController } from './setup/protected-probe.controller';

const LOGIN = '/api/auth/login';
const PROTECTED = '/api/e2e-protected';
const PROTECTED_PING = '/api/e2e-protected/ping';
const PASSWORD_INVALID = 'Informe a senha (até 128 caracteres).';
const INVALID_CREDENTIALS = {
  statusCode: 401,
  message: 'Usuário ou senha inválida.',
  error: 'Unauthorized',
};

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp({ controllers: [ProtectedProbeController] });
  });

  afterAll(async () => {
    await app.close();
  });

  const login = (body: object) =>
    request(app.getHttpServer()).post(LOGIN).send(body);

  describe('POST /api/auth/login', () => {
    it('200 com CPF mascarado: devolve o token e o responsável', async () => {
      const response = await login({
        cpf: '969.294.560-04',
        password: '123456',
      });

      expect(response.status).toBe(200);
      expect(Object.keys(response.body as object).sort()).toEqual([
        'accessToken',
        'guardian',
      ]);
      expect(response.body).toEqual({
        accessToken: expect.any(String) as string,
        guardian: {
          id: expect.any(String) as string,
          firstName: 'Gustavo',
          lastName: 'da Silva',
        },
      });
    });

    it('200 com CPF só com dígitos', async () => {
      const response = await login({ cpf: '50879567007', password: '987654' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        guardian: { firstName: 'Adelaide' },
      });
    });

    it('200 para o responsável sem aluno', async () => {
      const response = await login({
        cpf: '314.159.265-90',
        password: '111111',
      });

      expect(response.status).toBe(200);
    });

    it('401 com senha errada', async () => {
      const response = await login({
        cpf: '969.294.560-04',
        password: '654321',
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual(INVALID_CREDENTIALS);
    });

    it('401 com CPF válido que não está cadastrado, com a mesma resposta', async () => {
      const response = await login({
        cpf: '529.982.247-25',
        password: '123456',
      });

      expect(response.status).toBe(401);
      expect(response.body).toEqual(INVALID_CREDENTIALS);
    });

    it.each(['969.294.560-05', '11111111111', '969294560', 'abc'])(
      '400 com CPF malformado "%s"',
      async (cpf) => {
        const response = await login({ cpf, password: '123456' });

        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({
          statusCode: 400,
          error: 'Bad Request',
          message: ['CPF inválido.'],
        });
      },
    );

    it('400 com campo extra no corpo (forbidNonWhitelisted)', async () => {
      const response = await login({
        cpf: '969.294.560-04',
        password: '123456',
        role: 'admin',
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        message: ['property role should not exist'],
      });
    });

    it('400 com senha vazia', async () => {
      const response = await login({ cpf: '969.294.560-04', password: '' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ message: [PASSWORD_INVALID] });
    });

    it('400 sem senha', async () => {
      const response = await login({ cpf: '969.294.560-04' });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ message: [PASSWORD_INVALID] });
    });

    it('400 com senha que não é texto', async () => {
      const response = await login({ cpf: '969.294.560-04', password: 123456 });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ message: [PASSWORD_INVALID] });
    });

    it('400 com senha maior que 128 caracteres', async () => {
      const response = await login({
        cpf: '969.294.560-04',
        password: 'a'.repeat(129),
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ message: [PASSWORD_INVALID] });
    });
  });

  describe('rota protegida', () => {
    it('200 com o token do login, e o @CurrentGuardian() traz só o id', async () => {
      const {
        body: { accessToken, guardian },
      } = (await login({ cpf: '969.294.560-04', password: '123456' })) as {
        body: { accessToken: string; guardian: { id: string } };
      };

      const response = await request(app.getHttpServer())
        .get(PROTECTED)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: guardian.id });
    });

    it('401 sem token', async () => {
      const response = await request(app.getHttpServer()).get(PROTECTED_PING);

      expect(response.status).toBe(401);
    });

    it('401 com token que não é JWT', async () => {
      const response = await request(app.getHttpServer())
        .get(PROTECTED_PING)
        .set('Authorization', 'Bearer abc.def.ghi');

      expect(response.status).toBe(401);
    });

    it('401 com token assinado por outro segredo', async () => {
      const forged = new JwtService({ secret: 'outro-segredo' }).sign({
        sub: 'qualquer',
      });

      const response = await request(app.getHttpServer())
        .get(PROTECTED_PING)
        .set('Authorization', `Bearer ${forged}`);

      expect(response.status).toBe(401);
    });

    it('401 com token expirado', async () => {
      const expired = new JwtService({
        secret: process.env.JWT_SECRET,
      }).sign({ sub: 'qualquer', exp: Math.floor(Date.now() / 1000) - 60 });

      const response = await request(app.getHttpServer())
        .get(PROTECTED_PING)
        .set('Authorization', `Bearer ${expired}`);

      expect(response.status).toBe(401);
    });

    it('401 com token sem "Bearer"', async () => {
      const {
        body: { accessToken },
      } = (await login({ cpf: '969.294.560-04', password: '123456' })) as {
        body: { accessToken: string };
      };

      const response = await request(app.getHttpServer())
        .get(PROTECTED_PING)
        .set('Authorization', accessToken);

      expect(response.status).toBe(401);
    });

    it('/api/health continua público', async () => {
      await request(app.getHttpServer()).get('/api/health').expect(200);
    });
  });
});

import { INestApplication } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/infra/prisma/prisma.service';
import { createTestApp } from './setup/create-test-app';

const ISSUER = 'fiap-school-api';
const AUDIENCE = 'fiap-school-app';

describe('Validação do JWT (e2e)', () => {
  let app: INestApplication<App>;
  let gustavoId: string;
  const raw = new JwtService({ secret: process.env.JWT_SECRET });

  beforeAll(async () => {
    app = await createTestApp();
    gustavoId = (
      await app
        .get(PrismaService)
        .guardian.findUniqueOrThrow({ where: { cpf: '96929456004' } })
    ).id;
  });

  afterAll(async () => {
    await app.close();
  });

  const sign = (payload: Record<string, unknown>, options: JwtSignOptions) =>
    raw.sign(
      { sub: gustavoId, ...payload },
      { algorithm: 'HS256', ...options },
    );

  const meStatus = async (token: string) =>
    (
      await request(app.getHttpServer())
        .get('/api/me')
        .set('Authorization', `Bearer ${token}`)
    ).status;

  it('o token do login traz exp, iss e aud', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ cpf: '969.294.560-04', password: '123456' })
      .expect(200);
    const token = (login.body as { accessToken: string }).accessToken;

    expect(raw.decode(token)).toMatchObject({
      sub: gustavoId,
      iss: ISSUER,
      aud: AUDIENCE,
      exp: expect.any(Number) as number,
    });
    expect(await meStatus(token)).toBe(200);
  });

  it('aceita um token correto assinado fora do login (controle)', async () => {
    expect(
      await meStatus(
        sign({}, { issuer: ISSUER, audience: AUDIENCE, expiresIn: '1h' }),
      ),
    ).toBe(200);
  });

  it('recusa token sem exp', async () => {
    expect(
      await meStatus(sign({}, { issuer: ISSUER, audience: AUDIENCE })),
    ).toBe(401);
  });

  it('recusa token de outro emissor', async () => {
    expect(
      await meStatus(
        sign({}, { issuer: 'outro', audience: AUDIENCE, expiresIn: '1h' }),
      ),
    ).toBe(401);
  });

  it('recusa token para outro público', async () => {
    expect(
      await meStatus(
        sign({}, { issuer: ISSUER, audience: 'outro', expiresIn: '1h' }),
      ),
    ).toBe(401);
  });

  it('recusa token mais velho que JWT_EXPIRES_IN, mesmo com exp distante', async () => {
    const eightDaysAgo = Math.floor(Date.now() / 1000) - 8 * 24 * 3600;
    expect(
      await meStatus(
        sign(
          { iat: eightDaysAgo },
          { issuer: ISSUER, audience: AUDIENCE, expiresIn: '30d' },
        ),
      ),
    ).toBe(401);
  });
});

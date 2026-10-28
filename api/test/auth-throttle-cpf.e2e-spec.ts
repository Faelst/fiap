import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

// Atacante atrás de proxy trocando de IP a cada tentativa: o limite por IP
// (alto aqui) não pega, o limite por CPF sim.
process.env.TRUST_PROXY = '1';
process.env.LOGIN_THROTTLE_LIMIT = '1000';
process.env.LOGIN_THROTTLE_CPF_LIMIT = '3';
process.env.LOGIN_THROTTLE_CPF_TTL_MS = '900000';

describe('Rate limit do login por CPF (e2e)', () => {
  let app: INestApplication<App>;
  let ip = 0;

  beforeAll(async () => {
    const { createTestApp } = await import('./setup/create-test-app.js');
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const attempt = (cpf: unknown, password = 'errada') =>
    request(app.getHttpServer())
      .post('/api/auth/login')
      .set('X-Forwarded-For', `203.0.113.${++ip}`)
      .send({ cpf, password });

  it('o mesmo CPF recebe 429 mesmo com IP diferente a cada tentativa', async () => {
    expect((await attempt('969.294.560-04')).status).toBe(401);
    // Com e sem máscara contam juntos.
    expect((await attempt('96929456004')).status).toBe(401);
    expect((await attempt('969.294.560-04')).status).toBe(401);

    const blocked = await attempt('969.294.560-04');
    expect(blocked.status).toBe(429);
    expect(blocked.body).toMatchObject({
      statusCode: 429,
      message:
        'Muitas tentativas de login. Aguarde um pouco e tente novamente.',
    });
    // Nem a senha certa entra enquanto o CPF está bloqueado.
    expect((await attempt('96929456004', '123456')).status).toBe(429);
  });

  it('outro CPF não é afetado', async () => {
    expect((await attempt('508.795.670-07')).status).toBe(401);
  });

  it('CPF inválido não cria chave por CPF (só o limite por IP vale)', async () => {
    for (let i = 0; i < 5; i++) {
      expect((await attempt('123')).status).toBe(400);
    }
  });
});

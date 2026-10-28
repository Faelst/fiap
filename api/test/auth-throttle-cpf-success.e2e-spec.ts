import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

// O limite por CPF conta só falhas: login certo não gasta tentativa e zera
// as falhas anteriores.
process.env.LOGIN_THROTTLE_LIMIT = '1000';
process.env.LOGIN_THROTTLE_CPF_LIMIT = '3';
process.env.LOGIN_THROTTLE_CPF_TTL_MS = '900000';

describe('Limite por CPF conta só falhas (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const { createTestApp } = await import('./setup/create-test-app.js');
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const login = (cpf: string, password: string) =>
    request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ cpf, password });

  it('11 logins certos seguidos do mesmo CPF passam todos (limite 3)', async () => {
    for (let i = 0; i < 11; i++) {
      expect((await login('969.294.560-04', '123456')).status).toBe(200);
    }
  });

  it('o login certo zera as falhas anteriores', async () => {
    expect((await login('508.795.670-07', 'errada')).status).toBe(401);
    expect((await login('508.795.670-07', 'errada')).status).toBe(401);
    expect((await login('508.795.670-07', '987654')).status).toBe(200);
    expect((await login('508.795.670-07', 'errada')).status).toBe(401);
    expect((await login('508.795.670-07', 'errada')).status).toBe(401);
    expect((await login('508.795.670-07', 'errada')).status).toBe(401);
    // Agora são 3 falhas seguidas: bloqueado.
    expect((await login('508.795.670-07', '987654')).status).toBe(429);
  });
});

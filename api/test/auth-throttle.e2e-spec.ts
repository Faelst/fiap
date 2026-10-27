import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

// O test-env.ts sobe o limite para 1000. Aqui ele volta a ser pequeno; o
// AppModule é importado só depois (import dinâmico), quando a env já mudou.
process.env.LOGIN_THROTTLE_LIMIT = '3';
process.env.LOGIN_THROTTLE_TTL_MS = '60000';

describe('Rate limit do login (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const { createTestApp } = await import('./setup/create-test-app.js');
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde 429 depois do limite de tentativas por IP', async () => {
    const attempt = () =>
      request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ cpf: '969.294.560-04', password: 'errada' });

    for (let i = 0; i < 3; i++) {
      expect((await attempt()).status).toBe(401);
    }

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body).toMatchObject({
      statusCode: 429,
      message:
        'Muitas tentativas de login. Aguarde um pouco e tente novamente.',
    });
  });

  it('sem TRUST_PROXY, o X-Forwarded-For não troca o IP do cliente', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('X-Forwarded-For', '198.51.100.7')
      .send({ cpf: '969.294.560-04', password: 'errada' });

    expect(response.status).toBe(429);
  });

  it('o limite vale só para o login', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer()).get('/api/health').expect(200);
    }
  });
});

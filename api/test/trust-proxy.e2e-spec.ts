import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

// Um proxy na frente (TRUST_PROXY=1): o IP do cliente vem do X-Forwarded-For.
process.env.TRUST_PROXY = '1';
process.env.LOGIN_THROTTLE_LIMIT = '2';

describe('trust proxy (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const { createTestApp } = await import('./setup/create-test-app.js');
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const attemptFrom = (ip: string) =>
    request(app.getHttpServer())
      .post('/api/auth/login')
      .set('X-Forwarded-For', ip)
      .send({ cpf: '969.294.560-04', password: 'errada' });

  it('o rate limit separa os clientes pelo IP que o proxy repassa', async () => {
    expect((await attemptFrom('203.0.113.1')).status).toBe(401);
    expect((await attemptFrom('203.0.113.1')).status).toBe(401);
    expect((await attemptFrom('203.0.113.1')).status).toBe(429);

    expect((await attemptFrom('203.0.113.2')).status).toBe(401);
  });
});

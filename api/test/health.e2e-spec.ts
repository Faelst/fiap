import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './setup/create-test-app';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health responde 200 com status ok', async () => {
    const response = await request(app.getHttpServer()).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('as rotas ficam sob o prefixo /api', async () => {
    await request(app.getHttpServer()).get('/health').expect(404);
  });

  it('libera o CORS para a origem configurada', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .set('Origin', 'http://localhost:8081');

    expect(response.headers['access-control-allow-origin']).toBe('*');
  });
});

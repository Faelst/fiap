import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

// Desliga o Swagger antes de importar o AppModule (a env é lida no import).
process.env.SWAGGER_ENABLED = 'false';

describe('Swagger desligado por env (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const { createTestApp } = await import('./setup/create-test-app.js');
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each(['/docs', '/docs-json'])('%s responde 404', async (path) => {
    await request(app.getHttpServer()).get(path).expect(404);
  });

  it('a API continua no ar', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200);
  });
});

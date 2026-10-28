import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './setup/create-test-app';

describe('Headers de segurança (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('não revela o express (sem X-Powered-By)', async () => {
    const response = await request(app.getHttpServer()).get('/api/health');
    expect(response.headers).not.toHaveProperty('x-powered-by');
  });

  it('manda os headers do helmet na API', async () => {
    const response = await request(app.getHttpServer()).get('/api/health');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['content-security-policy']).toContain(
      "default-src 'self'",
    );
  });

  it('a CSP do /docs deixa o Swagger UI carregar (scripts próprios, sem upgrade para https)', async () => {
    const response = await request(app.getHttpServer()).get('/docs');
    const csp = response.headers['content-security-policy'];

    expect(response.status).toBe(200);
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("'unsafe-inline'"); // os <style> inline do Swagger UI
    expect(csp).not.toContain('upgrade-insecure-requests');
    // O HTML só usa script externo do próprio /docs, que a CSP permite.
    expect(response.text).not.toMatch(/<script>(?!<\/script>)/);
  });
});

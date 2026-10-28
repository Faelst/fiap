import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './setup/create-test-app';

interface OpenApiOperation {
  tags?: string[];
  security?: Array<Record<string, string[]>>;
  responses: Record<string, unknown>;
  requestBody?: unknown;
}

interface OpenApiDocument {
  paths: Record<string, Record<string, OpenApiOperation>>;
  components: {
    securitySchemes: Record<string, unknown>;
    schemas: Record<string, { properties?: Record<string, unknown> }>;
  };
}

const ROUTES = [
  ['post', '/api/auth/login'],
  ['get', '/api/health'],
  ['get', '/api/me'],
  ['get', '/api/students/{id}/agenda'],
  ['get', '/api/students/{id}/report-cards'],
  ['get', '/api/students/{id}/report-cards/{year}'],
] as const;

describe('Swagger (e2e)', () => {
  let app: INestApplication<App>;
  let doc: OpenApiDocument;

  beforeAll(async () => {
    app = await createTestApp();
    const response = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);
    doc = response.body as OpenApiDocument;
  });

  afterAll(async () => {
    await app.close();
  });

  const operation = (method: string, path: string) => doc.paths[path]?.[method];

  it('a UI em /docs é pública e fica fora do prefixo /api', async () => {
    const response = await request(app.getHttpServer()).get('/docs');

    expect(response.status).toBe(200);
    expect(response.text).toContain('swagger-ui');
  });

  it('lista exatamente as 6 rotas da API', () => {
    const listed = Object.entries(doc.paths).flatMap(([path, methods]) =>
      Object.keys(methods).map((method) => `${method} ${path}`),
    );

    expect(listed.sort()).toEqual(
      ROUTES.map(([method, path]) => `${method} ${path}`).sort(),
    );
  });

  it('não lista a rota de teste dos e2e', () => {
    expect(Object.keys(doc.paths)).not.toContain('/api/e2e-protected');
  });

  it('tem o esquema Bearer (JWT) para o botão Authorize', () => {
    expect(doc.components.securitySchemes).toMatchObject({
      bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    });
  });

  it.each(
    ROUTES.filter(
      ([, path]) => path.startsWith('/api/students') || path === '/api/me',
    ),
  )('%s %s exige o Bearer e documenta o 401', (method, path) => {
    const op = operation(method, path);
    expect(op.security).toEqual([{ bearer: [] }]);
    expect(op.responses).toHaveProperty('401');
  });

  it.each([
    ['post', '/api/auth/login'],
    ['get', '/api/health'],
  ])('%s %s é pública (sem Bearer)', (method, path) => {
    expect(operation(method, path).security).toBeUndefined();
  });

  it('cada rota tem tag e resposta de sucesso com esquema', () => {
    for (const [method, path] of ROUTES) {
      const op = operation(method, path);
      expect(op.tags?.length).toBeGreaterThan(0);
      expect(op.responses['200']).toHaveProperty('content');
    }
  });

  it('o login documenta corpo (com exemplo do seed), 400, 401 e 429', () => {
    const op = operation('post', '/api/auth/login');
    expect(Object.keys(op.responses).sort()).toEqual([
      '200',
      '400',
      '401',
      '429',
    ]);
    expect(doc.components.schemas.LoginDto.properties).toMatchObject({
      cpf: { type: 'string', example: '969.294.560-04' },
      password: { type: 'string', example: '123456' },
    });
  });

  it('as rotas do aluno documentam 403, e o boletim também 400 e 404', () => {
    for (const [method, path] of ROUTES.filter(([, p]) =>
      p.startsWith('/api/students'),
    )) {
      expect(operation(method, path).responses).toHaveProperty('403');
    }
    expect(
      Object.keys(
        operation('get', '/api/students/{id}/report-cards/{year}').responses,
      ).sort(),
    ).toEqual(['200', '400', '401', '403', '404']);
  });

  it('descreve os campos das respostas (DTOs de saída)', () => {
    expect(doc.components.schemas.MeResponse.properties).toHaveProperty(
      'students',
    );
    expect(doc.components.schemas.ReportCardResponse.properties).toHaveProperty(
      'terms',
    );
    expect(doc.components.schemas.AgendaDayResponse.properties).toHaveProperty(
      'lessons',
    );
  });
});

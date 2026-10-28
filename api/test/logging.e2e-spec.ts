import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ACCOUNTS } from './setup/auth-helpers';
import { createLogCapture } from './setup/log-capture';

// O test-env.ts deixa o log em silêncio. Aqui ele volta ao nível de produção
// antes de o AppModule ser importado (import dinâmico), e o stream é capturado.
process.env.LOG_LEVEL = 'info';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

interface RequestLog {
  level: number;
  msg: string;
  req: { id: string; method: string; url: string; headers: object };
  res: { statusCode: number };
}

describe('Logs de requisição (e2e)', () => {
  let app: INestApplication<App>;
  const capture = createLogCapture();

  beforeAll(async () => {
    const { createTestApp } = await import('./setup/create-test-app.js');
    app = await createTestApp({ logDestination: capture.stream });
  });

  afterAll(async () => {
    await app.close();
  });

  const requestLogs = () =>
    capture.lines.filter(
      (line) => 'req' in line && 'res' in line,
    ) as unknown as RequestLog[];

  const findRequestLog = (id: string) =>
    requestLogs().find((line) => line.req.id === id);

  it('login, /me e boletim não deixam senha, CPF nem token no log', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Cookie', 'sessao=cookie-secreto')
      .send(ACCOUNTS.gustavo)
      .expect(200);
    const token = (login.body as { accessToken: string }).accessToken;
    const me = await request(app.getHttpServer())
      .get('/api/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const [student] = (me.body as { students: Array<{ id: string }> }).students;
    await request(app.getHttpServer())
      .get(`/api/students/${student.id}/report-cards/2025`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    // Senha errada também passa pelo log (nível warn).
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ cpf: ACCOUNTS.gustavo.cpf, password: 'senha-errada-999' })
      .expect(401);

    const log = capture.text();
    expect(requestLogs().length).toBeGreaterThanOrEqual(4);
    for (const secret of [
      `"${ACCOUNTS.gustavo.password}"`,
      'senha-errada-999',
      ACCOUNTS.gustavo.cpf,
      '96929456004',
      token,
      token.split('.')[1],
      'Bearer',
      'cookie-secreto',
    ]) {
      expect(log).not.toContain(secret);
    }
  });

  it('loga método, rota e status da requisição', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    const entry = findRequestLog(response.headers['x-request-id']);
    expect(entry).toMatchObject({
      level: 30,
      msg: 'request completed',
      req: { method: 'GET', url: '/api/health' },
      res: { statusCode: 200 },
    });
  });

  it('a query string não vai para o log', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health?access_token=eyJ.segredo-na-url&cpf=96929456004')
      .expect(200);

    const entry = findRequestLog(response.headers['x-request-id']);
    expect(entry?.req.url).toBe('/api/health');
    expect(entry?.req).not.toHaveProperty('query');
    const line = JSON.stringify(entry);
    expect(line).not.toContain('segredo-na-url');
    expect(line).not.toContain('96929456004');
  });

  it('erro do cliente (4xx) sai como warn', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/me')
      .expect(401);

    expect(findRequestLog(response.headers['x-request-id'])?.level).toBe(40);
  });

  it('gera um x-request-id (UUID) e devolve no header', async () => {
    const response = await request(app.getHttpServer()).get('/api/health');

    expect(response.headers['x-request-id']).toMatch(UUID_V4);
  });

  it('reaproveita o x-request-id válido do app', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .set('x-request-id', 'app-req-123');

    expect(response.headers['x-request-id']).toBe('app-req-123');
    expect(findRequestLog('app-req-123')).toBeDefined();
  });

  it('troca o x-request-id inválido por um UUID', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .set('x-request-id', 'x'.repeat(65));

    expect(response.headers['x-request-id']).toMatch(UUID_V4);
  });

  it('usa o pino como logger do Nest (logs de boot em JSON)', () => {
    expect(
      capture.lines.some(
        (line) =>
          line.context === 'RoutesResolver' ||
          line.context === 'RouterExplorer',
      ),
    ).toBe(true);
  });
});

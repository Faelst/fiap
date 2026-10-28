import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './setup/create-test-app';
import { loginAs } from './setup/auth-helpers';

const SESSION_INVALID = {
  statusCode: 401,
  message: 'Sessão inválida ou expirada.',
  error: 'Unauthorized',
};

describe('Corpo dos erros de sessão (e2e)', () => {
  let app: INestApplication<App>;
  let orphanToken: string;
  let rafaelId: string;

  beforeAll(async () => {
    app = await createTestApp();
    // Assinado pelo próprio JwtService da API: token válido em tudo, mas de um
    // responsável que não existe.
    orphanToken = app.get(JwtService).sign({ sub: 'responsavel-apagado' });
    const token = await loginAs(app, 'gustavo');
    const me = await request(app.getHttpServer())
      .get('/api/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    rafaelId = (
      me.body as { students: Array<{ id: string; firstName: string }> }
    ).students.find((student) => student.firstName === 'Rafael')!.id;
  });

  afterAll(async () => {
    await app.close();
  });

  const get = (path: string, token?: string) => {
    const call = request(app.getHttpServer()).get(path);
    return token ? call.set('Authorization', `Bearer ${token}`) : call;
  };

  it('sem token: 401 em português', async () => {
    const response = await get('/api/me');
    expect(response.status).toBe(401);
    expect(response.body).toEqual(SESSION_INVALID);
  });

  it('token inválido: 401 em português', async () => {
    const response = await get('/api/me', 'abc.def.ghi');
    expect(response.status).toBe(401);
    expect(response.body).toEqual(SESSION_INVALID);
  });

  it('rota de aluno sem token: 401 em português', async () => {
    const response = await get(`/api/students/${rafaelId}/agenda`);
    expect(response.status).toBe(401);
    expect(response.body).toEqual(SESSION_INVALID);
  });

  it.each(['/api/me', '/api/students/{rafael}/agenda'])(
    'responsável que não existe mais em %s: 401 em português',
    async (path) => {
      const response = await get(
        path.replace('{rafael}', rafaelId),
        orphanToken,
      );
      expect(response.status).toBe(401);
      expect(response.body).toEqual(SESSION_INVALID);
    },
  );
});

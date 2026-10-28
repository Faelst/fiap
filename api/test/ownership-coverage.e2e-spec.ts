import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/infra/prisma/prisma.service';
import { createTestApp } from './setup/create-test-app';
import { loginAs } from './setup/auth-helpers';

interface RouteLayer {
  route?: { path: string; methods: Record<string, boolean> };
}

/** Todas as rotas registradas no express (de qualquer controller). */
function registeredRoutes(app: INestApplication): Array<[string, string]> {
  const http = app.getHttpAdapter().getInstance() as {
    router: { stack: RouteLayer[] };
  };
  return http.router.stack.flatMap((layer) =>
    layer.route
      ? Object.keys(layer.route.methods).map(
          (method) => [method, layer.route!.path] as [string, string],
        )
      : [],
  );
}

/**
 * Toda rota com `:id` é de um aluno, e o repositório não filtra por
 * responsável: quem garante o acesso é o @StudentOwnership(). Este teste
 * percorre as rotas registradas, então uma rota nova com `:id` sem o guard
 * (em qualquer controller) quebra aqui.
 */
describe('Cobertura do guard de ownership (e2e)', () => {
  let app: INestApplication<App>;
  let rafaelId: string;
  let adelaide: string;
  let gustavo: string;
  let routes: Array<[string, string]>;

  beforeAll(async () => {
    app = await createTestApp();
    rafaelId = (
      await app
        .get(PrismaService)
        .student.findUniqueOrThrow({ where: { rm: 12567 } })
    ).id;
    [adelaide, gustavo] = await Promise.all([
      loginAs(app, 'adelaide'),
      loginAs(app, 'gustavo'),
    ]);
    routes = registeredRoutes(app).filter(([, path]) => path.includes(':id'));
  });

  afterAll(async () => {
    await app.close();
  });

  const fill = (path: string) =>
    path
      .replace(':id', rafaelId)
      .replace(':year', '2025')
      .replace(/:(\w+)/g, '$1');

  const call = (method: string, path: string, token: string) =>
    request(app.getHttpServer())
      [method as 'get'](fill(path))
      .set('Authorization', `Bearer ${token}`);

  it('acha as rotas por aluno (a lista não está vazia por engano)', () => {
    expect(routes.map(([method, path]) => `${method} ${path}`)).toEqual(
      expect.arrayContaining([
        'get /api/students/:id/agenda',
        'get /api/students/:id/report-cards',
        'get /api/students/:id/report-cards/:year',
      ]),
    );
  });

  it('toda rota com :id dá 403 para o responsável que não é do aluno', async () => {
    for (const [method, path] of routes) {
      const response = await call(method, path, adelaide);
      expect({ route: `${method} ${path}`, status: response.status }).toEqual({
        route: `${method} ${path}`,
        status: 403,
      });
    }
  });

  it('e não dá 403 para o responsável do aluno (o caminho montado é válido)', async () => {
    for (const [method, path] of routes) {
      const response = await call(method, path, gustavo);
      expect({
        route: `${method} ${path}`,
        status: response.status,
      }).not.toEqual({
        route: `${method} ${path}`,
        status: 403,
      });
    }
  });
});

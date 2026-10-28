import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BEARER_AUTH } from './shared/swagger/api-docs';

/** UI em /docs e o OpenAPI em /docs-json, fora do prefixo /api. */
export const SWAGGER_PATH = 'docs';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('FIAP School API')
    .setDescription(
      [
        'Agenda e boletim dos alunos para os responsáveis.',
        '',
        '1. `POST /api/auth/login` com um responsável do seed, por exemplo',
        '   CPF `969.294.560-04` e senha `123456` (Gustavo).',
        '2. Copie o `accessToken` e cole em **Authorize**.',
        '3. Pegue o id de um aluno em `GET /api/me` e use nas rotas `/api/students/{id}`.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      BEARER_AUTH,
    )
    .build();

  SwaggerModule.setup(
    SWAGGER_PATH,
    app,
    () => SwaggerModule.createDocument(app, config),
    { swaggerOptions: { persistAuthorization: true } },
  );
}

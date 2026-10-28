import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponse } from './error-response';

/** Nome do esquema de segurança do Swagger (botão Authorize). */
export const BEARER_AUTH = 'bearer';

/** Rota com JWT: Bearer no Swagger e o 401 documentado. */
export function ApiAuthenticated() {
  return applyDecorators(
    ApiBearerAuth(BEARER_AUTH),
    ApiUnauthorizedResponse({
      type: ErrorResponse,
      description:
        'Sem token, token inválido/expirado ou responsável removido.',
    }),
  );
}

/** Rota de um aluno: além do JWT, o aluno precisa ser do responsável. */
export function ApiStudentRoute() {
  return applyDecorators(
    ApiAuthenticated(),
    ApiForbiddenResponse({
      type: ErrorResponse,
      description:
        'O aluno não é vinculado ao responsável logado (ou não existe).',
    }),
  );
}

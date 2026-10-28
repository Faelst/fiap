import type { z } from 'zod';

import { logger } from '../logger';
import { ApiError } from './errors';

/**
 * Valida a resposta contra o schema do contrato. Fora do contrato vira
 * `ApiError('invalidResponse')` (a tela mostra o estado de erro) e o log
 * registra só o caminho e o código de cada problema, nunca o valor recebido.
 */
export function parseResponse<S extends z.ZodType>(
  schema: S,
  data: unknown,
  endpoint: string,
): z.infer<S> {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  logger.error('resposta fora do contrato', {
    endpoint,
    issues: result.error.issues.map(issue => ({
      path: issue.path.join('.'),
      code: issue.code,
    })),
  });
  throw new ApiError('invalidResponse', { cause: result.error });
}

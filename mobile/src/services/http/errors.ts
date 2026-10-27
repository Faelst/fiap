import { isAxiosError } from 'axios';
import { z, ZodError } from 'zod';

export type ApiErrorKind =
  | 'badRequest'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'rateLimited'
  | 'server'
  | 'network'
  | 'invalidResponse'
  | 'unknown';

type ApiErrorOptions = {
  status?: number;
  apiMessage?: string;
  cause?: unknown;
};

/**
 * Erro único da camada HTTP. Os ViewModels decidem o texto da tela pelo
 * `kind`, sem conhecer axios nem zod.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly apiMessage?: string;

  constructor(kind: ApiErrorKind, options: ApiErrorOptions = {}) {
    super(options.apiMessage ?? kind);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options.status;
    this.apiMessage = options.apiMessage;
  }
}

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 400) return 'badRequest';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 429) return 'rateLimited';
  if (status >= 500) return 'server';
  return 'unknown';
}

/**
 * Corpo de erro do Nest: `{statusCode, message, error}`. O `message` é string
 * (regra de negócio) ou lista (ValidationPipe); a UI recebe uma só, a primeira.
 */
export const apiErrorBodySchema = z.object({
  statusCode: z.number().optional(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
});

function messageFrom(data: unknown): string | undefined {
  const parsed = apiErrorBodySchema.safeParse(data);
  if (!parsed.success) return undefined;
  const { message } = parsed.data;
  return typeof message === 'string' ? message : message[0];
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof ZodError) {
    return new ApiError('invalidResponse', { cause: error });
  }
  if (isAxiosError(error)) {
    if (!error.response) {
      return new ApiError('network', { cause: error });
    }
    const { status, data } = error.response;
    return new ApiError(kindFromStatus(status), {
      status,
      apiMessage: messageFrom(data),
    });
  }
  return new ApiError('unknown', { cause: error });
}

import { isAxiosError, isCancel } from 'axios';
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
  /** Request abortado pelo `signal` (troca de aluno, logout). Não é falha. */
  | 'canceled'
  /** Falha do aparelho (keychain/Keystore), não da API. */
  | 'storage'
  | 'unknown';

type ApiErrorOptions = {
  status?: number;
  /** Mensagem que veio da API (`message` do Nest). */
  apiMessage?: string;
  /** Mensagem do próprio app, quando o erro não vem da API. */
  message?: string;
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
    super(options.apiMessage ?? options.message ?? kind, {
      cause: options.cause,
    });
    this.name = 'ApiError';
    // O Hermes pode ignorar o 2º argumento do Error; garante a causa.
    if (options.cause !== undefined && this.cause === undefined) {
      this.cause = options.cause;
    }
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

/** Causa de um erro HTTP sem nada que identifique o usuário. */
export type HttpErrorCause = {
  name: string;
  code?: string;
  status?: number;
  method?: string;
  url?: string;
};

/**
 * O AxiosError carrega `config.data` (CPF e senha do login), `config.headers`
 * (Bearer) e `response.data`. Na `cause` fica só o que ajuda a depurar, para o
 * erro poder ser serializado (React Query, Reactotron) sem vazar dado.
 */
function httpCause(error: {
  name: string;
  code?: string;
  config?: { method?: string; url?: string };
  response?: { status: number };
}): HttpErrorCause {
  return {
    name: error.name,
    code: error.code,
    status: error.response?.status,
    method: error.config?.method?.toUpperCase(),
    url: error.config?.url?.split('?')[0],
  };
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof ZodError) {
    return new ApiError('invalidResponse', { cause: error });
  }
  if (isCancel(error)) {
    return new ApiError('canceled', { cause: httpCause(error) });
  }
  if (isAxiosError(error)) {
    if (!error.response) {
      return new ApiError('network', { cause: httpCause(error) });
    }
    const { status, data } = error.response;
    return new ApiError(kindFromStatus(status), {
      status,
      apiMessage: messageFrom(data),
      cause: httpCause(error),
    });
  }
  return new ApiError('unknown', { cause: error });
}

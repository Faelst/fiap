import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import type { LogLevel, Logger } from '../logger';
import { type ApiErrorKind, toApiError } from './errors';

/** Rotas sem token, em que 401 é resposta de negócio (credencial errada). */
export const PUBLIC_PATHS = new Set(['/auth/login']);

type InterceptorDeps = {
  getToken: () => Promise<string | null>;
  /**
   * Chamado em 401 de rota protegida, com o token com que o request saiu
   * (`null` se saiu sem token). Quem decide se a sessão atual acabou é ele.
   */
  onUnauthorized: (requestToken: string | null) => Promise<void> | void;
  logger: Logger;
  now?: () => number;
};

/**
 * Nível do log de erro. Resposta esperada da API (credencial errada, sem
 * acesso, ano inexistente) não é `warn`: em dev o `console.warn` abre o toast
 * do LogBox em cima do botão da tela.
 */
const ERROR_LOG_LEVEL: Record<ApiErrorKind, LogLevel> = {
  badRequest: 'info',
  unauthorized: 'info',
  forbidden: 'info',
  notFound: 'info',
  rateLimited: 'info',
  canceled: 'debug',
  server: 'warn',
  network: 'warn',
  invalidResponse: 'warn',
  storage: 'warn',
  unknown: 'warn',
};

type RequestMeta = { startedAt: number; token: string | null };

const requestMeta = new WeakMap<InternalAxiosRequestConfig, RequestMeta>();

const isPublic = (config?: InternalAxiosRequestConfig) =>
  PUBLIC_PATHS.has(config?.url ?? '');

export function attachInterceptors(
  instance: AxiosInstance,
  { getToken, onUnauthorized, logger, now = Date.now }: InterceptorDeps,
) {
  const describe = (config: InternalAxiosRequestConfig | undefined) => {
    const method = (config?.method ?? 'get').toUpperCase();
    const url = config?.url ?? '';
    const meta = config ? requestMeta.get(config) : undefined;
    return {
      method,
      url,
      durationMs: meta === undefined ? undefined : now() - meta.startedAt,
    };
  };

  instance.interceptors.request.use(async config => {
    // Um Authorization explícito (o token recém-emitido no login, antes de a
    // sessão abrir) vale mais que o da memória e não é da sessão atual: um
    // 401 dele não encerra a sessão.
    const explicit = config.headers.has('Authorization');
    const token = isPublic(config) || explicit ? null : await getToken();
    requestMeta.set(config, { startedAt: now(), token });
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  });

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const request = describe(response.config);
      logger.info(`http ${request.method} ${request.url} ${response.status}`, {
        ...request,
        status: response.status,
        requestId: response.headers['x-request-id'],
      });
      return response;
    },
    async (error: AxiosError) => {
      const apiError = toApiError(error);
      const request = describe(error.config);
      const status = apiError.status ?? 'sem resposta';
      logger[ERROR_LOG_LEVEL[apiError.kind]](
        `http ${request.method} ${request.url} ${status}`,
        {
          ...request,
          status: apiError.status,
          kind: apiError.kind,
          requestId: error.response?.headers?.['x-request-id'],
        },
      );

      if (apiError.kind === 'unauthorized' && !isPublic(error.config)) {
        const meta = error.config ? requestMeta.get(error.config) : undefined;
        await onUnauthorized(meta?.token ?? null);
      }
      throw apiError;
    },
  );
}

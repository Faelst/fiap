import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import type { Logger } from '../logger';
import { toApiError } from './errors';

/** Rotas sem token, em que 401 é resposta de negócio (credencial errada). */
export const PUBLIC_PATHS = new Set(['/auth/login']);

type InterceptorDeps = {
  getToken: () => Promise<string | null>;
  /** Chamado em 401 de rota protegida (token vencido ou revogado). */
  onUnauthorized: () => Promise<void> | void;
  logger: Logger;
  now?: () => number;
};

const startedAt = new WeakMap<InternalAxiosRequestConfig, number>();

const isPublic = (config?: InternalAxiosRequestConfig) =>
  PUBLIC_PATHS.has(config?.url ?? '');

export function attachInterceptors(
  instance: AxiosInstance,
  { getToken, onUnauthorized, logger, now = Date.now }: InterceptorDeps,
) {
  const describe = (config: InternalAxiosRequestConfig | undefined) => {
    const method = (config?.method ?? 'get').toUpperCase();
    const url = config?.url ?? '';
    const start = config ? startedAt.get(config) : undefined;
    return {
      method,
      url,
      durationMs: start === undefined ? undefined : now() - start,
    };
  };

  instance.interceptors.request.use(async config => {
    startedAt.set(config, now());
    if (!isPublic(config)) {
      const token = await getToken();
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
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
      logger.warn(`http ${request.method} ${request.url} ${status}`, {
        ...request,
        status: apiError.status,
        kind: apiError.kind,
        requestId: error.response?.headers?.['x-request-id'],
      });

      if (apiError.kind === 'unauthorized' && !isPublic(error.config)) {
        await onUnauthorized();
      }
      throw apiError;
    },
  );
}

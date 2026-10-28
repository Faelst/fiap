import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '../services/http/errors';

/** Erros que não mudam ao repetir o request. */
const FINAL_KINDS = new Set<ApiError['kind']>([
  'badRequest',
  'unauthorized',
  'forbidden',
  'notFound',
  'invalidResponse',
  'canceled',
  'storage',
]);

declare module '@tanstack/react-query' {
  interface Register {
    /** Todo erro de query/mutation passa pelo interceptor e vira ApiError. */
    defaultError: ApiError;
  }
}

const MAX_RETRIES = 1;

/** Os dados da escola mudam pouco: 5 min sem refetch automático. */
const STALE_TIME_MS = 5 * 60 * 1000;

export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && FINAL_KINDS.has(error.kind)) {
    return false;
  }
  return failureCount < MAX_RETRIES;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry, staleTime: STALE_TIME_MS },
      mutations: { retry: false },
    },
  });
}

export const queryClient = createQueryClient();

/** Query keys do app. Tudo que é de aluno leva o `studentId`. */
export const queryKeys = {
  me: () => ['me'] as const,
  agenda: (studentId: string) => ['agenda', studentId] as const,
  reportCards: (studentId: string) => ['reportCards', studentId] as const,
  reportCard: (studentId: string, year: number) =>
    ['reportCard', studentId, year] as const,
};

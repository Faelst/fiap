import type { QueryClient } from '@tanstack/react-query';
import type { StoreApi } from 'zustand';

import { redact } from '../services/logger/redact';

/**
 * Retratos do estado do app para o Reactotron (D15), só em dev. Os plugins
 * prontos do React Query para o Reactotron mandam o estado inteiro das
 * mutations, com as `variables` (CPF e senha do login) e o resultado (token),
 * sem opção de filtrar. Aqui o retrato é montado à mão:
 * - queries: chave, status e dados, redigidos (CPF, token);
 * - mutations: só chave e status;
 * - stores do zustand: só o estado (sem as ações), redigido.
 * Erros viram nome + mensagem (o `redact` já faz isso).
 */
export function snapshotQueryCache(queryClient: QueryClient) {
  const queries = queryClient
    .getQueryCache()
    .getAll()
    .map(({ queryKey, state }) => ({
      queryKey,
      status: state.status,
      fetchStatus: state.fetchStatus,
      dataUpdatedAt: state.dataUpdatedAt,
      data: state.data,
      error: state.error,
    }));
  const mutations = queryClient
    .getMutationCache()
    .getAll()
    .map(({ options, state }) => ({
      mutationKey: options.mutationKey,
      status: state.status,
    }));
  return redact({ queries, mutations });
}

type AnyStore = StoreApi<object>;

export function snapshotStore(store: AnyStore) {
  const state = Object.fromEntries(
    Object.entries(store.getState()).filter(
      ([, value]) => typeof value !== 'function',
    ),
  );
  return redact(state);
}

export type AppStateSnapshot = {
  queryCache: ReturnType<typeof snapshotQueryCache>;
  stores: Record<string, ReturnType<typeof snapshotStore>>;
};

type WatchOptions = {
  queryClient: QueryClient;
  stores: Record<string, AnyStore>;
  send: (snapshot: AppStateSnapshot) => void;
  /** Agrupa rajadas de mudanças (um fetch muda o cache várias vezes). */
  waitMs?: number;
};

/** Manda um retrato a cada mudança de cache ou de store. Devolve o `stop`. */
export function watchAppState({
  queryClient,
  stores,
  send,
  waitMs = 300,
}: WatchOptions) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const schedule = () => {
    if (timer !== undefined) return;
    timer = setTimeout(() => {
      timer = undefined;
      send({
        queryCache: snapshotQueryCache(queryClient),
        stores: Object.fromEntries(
          Object.entries(stores).map(([name, store]) => [
            name,
            snapshotStore(store),
          ]),
        ),
      });
    }, waitMs);
  };

  const unsubscribers = [
    queryClient.getQueryCache().subscribe(schedule),
    queryClient.getMutationCache().subscribe(schedule),
    ...Object.values(stores).map(store => store.subscribe(schedule)),
  ];

  return () => {
    unsubscribers.forEach(unsubscribe => unsubscribe());
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };
}

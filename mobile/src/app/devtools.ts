import { logger } from '../services/logger';
import { useBootStore } from '../stores/boot.store';
import { useSessionStore } from '../stores/session.store';
import { queryClient } from './queryClient';
import { watchAppState } from './stateInspector';

/**
 * Só em dev: liga o Reactotron como mais um destino do logger e manda para
 * ele o retrato do cache do React Query e das stores do zustand (D15), sem
 * variáveis de mutation nem token (ver `stateInspector.ts`).
 *
 * O `require` fica dentro do `if (__DEV__)`: o Metro remove o bloco em
 * release antes de juntar as dependências, então o Reactotron não entra no
 * bundle de produção (com um `return` antecipado, ele entrava inerte).
 */
export function setupDevtools() {
  if (__DEV__) {
    try {
      const { connectReactotron } = require('../services/logger/reactotron');
      const reactotron = connectReactotron();
      logger.addTransport(reactotron.transport);
      watchAppState({
        queryClient,
        stores: { session: useSessionStore, boot: useBootStore },
        send: snapshot => {
          const { queries, mutations } = snapshot.queryCache;
          reactotron.show(
            'ESTADO',
            `${queries.length} queries, ${mutations.length} mutations`,
            snapshot,
          );
        },
      });
    } catch (error) {
      logger.warn('Reactotron não conectou', { error });
    }
  }
}

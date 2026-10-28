import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import type { RootStackScreenProps } from '../../navigation/types';
import { ApiError } from '../../services/http/errors';
import { useBootStore } from '../../stores/boot.store';
import {
  useSessionStore,
  type SessionStatus,
} from '../../stores/session.store';
import { motion } from '../../theme';
import { loadMeOnBoot } from '../auth/api/loadMeOnBoot';

export type SplashDestination = 'login' | 'app' | 'noStudent' | 'bootError';

type SplashNavigation = Pick<
  RootStackScreenProps<'Splash'>['navigation'],
  'reset'
>;

const { minDuration, minDurationReduced, loopStartAt, hardTimeout, meTimeout } =
  motion.splash;

/** Rota de cada destino. Todas sabem que vieram da splash (entram sem animação do stack). */
const ROUTES = {
  login: { name: 'Login', params: { fromSplash: true } },
  app: { name: 'App', params: { screen: 'Agenda', fromSplash: true } },
  noStudent: { name: 'NoStudent', params: { fromSplash: true } },
  bootError: { name: 'BootError', params: { fromSplash: true } },
} as const;

/** Espera o `bootstrap` ler o keychain (status sai de `loading`). */
function waitForSession(signal: AbortSignal): Promise<SessionStatus> {
  return new Promise(resolve => {
    const current = useSessionStore.getState().status;
    if (current !== 'loading') {
      resolve(current);
      return;
    }
    const unsubscribe = useSessionStore.subscribe(({ status }) => {
      if (status !== 'loading') {
        unsubscribe();
        resolve(status);
      }
    });
    signal.addEventListener('abort', unsubscribe);
  });
}

/**
 * Destino pela sessão: sem token → Login; com token, o `/me` decide.
 * `null` quando o `/me` foi cancelado (não é erro de tela).
 */
async function resolveDestination(
  signal: AbortSignal,
): Promise<SplashDestination | null> {
  const status = await waitForSession(signal);
  if (status !== 'signedIn') {
    return 'login';
  }
  try {
    const me = await loadMeOnBoot({ timeoutMs: meTimeout, signal });
    return me.students.length > 0 ? 'app' : 'noStudent';
  } catch (error) {
    const kind = error instanceof ApiError ? error.kind : 'unknown';
    if (kind === 'canceled') return null;
    // O interceptor já encerrou a sessão (expirada); o Login mostra o aviso.
    if (kind === 'unauthorized') return 'login';
    return 'bootError';
  }
}

const wait = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

/**
 * Splash (01-design.md, 3.1.5). A sessão é lida em paralelo com a animação;
 * o destino só aparece depois da duração mínima, e uma trava de 10 s garante
 * que o app nunca fica preso aqui. A View anima a saída e chama
 * `onExitFinished` no fim, que troca de tela.
 */
export function useSplashViewModel(navigation: SplashNavigation) {
  const reducedMotion = useReducedMotion();
  const finishSplash = useBootStore(state => state.finishSplash);
  const [destination, setDestination] = useState<SplashDestination | null>(
    null,
  );
  const [loaderDue, setLoaderDue] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let decided = false;

    const decide = (next: SplashDestination | null) => {
      if (decided || next === null) return;
      decided = true;
      clearTimeout(hardTimer);
      clearTimeout(loaderTimer);
      controller.abort();
      setDestination(next);
    };

    // Folga de 300 ms depois do mínimo: o loop não pisca quando a resposta
    // chega logo em seguida.
    const loaderTimer = setTimeout(() => {
      if (!decided) setLoaderDue(true);
    }, loopStartAt);

    // Keychain ou /me que não respondem: com token é erro, sem token é Login.
    const hardTimer = setTimeout(() => {
      const { status, bootstrapTimedOut } = useSessionStore.getState();
      if (status === 'signedIn') {
        decide('bootError');
        return;
      }
      // Keychain sem resposta: segue sem sessão, e um token que chegue
      // depois não leva às abas sem passar pelo /me.
      bootstrapTimedOut();
      decide('login');
    }, hardTimeout);

    Promise.all([
      resolveDestination(controller.signal),
      wait(reducedMotion ? minDurationReduced : minDuration),
    ]).then(([next]) => decide(next));

    return () => {
      decided = true;
      clearTimeout(hardTimer);
      clearTimeout(loaderTimer);
      controller.abort();
    };
  }, [reducedMotion]);

  const onExitFinished = useCallback(() => {
    if (!destination) return;
    navigation.reset({ index: 0, routes: [ROUTES[destination]] });
    finishSplash();
  }, [destination, finishSplash, navigation]);

  return {
    destination,
    /** Trilho de espera: só enquanto a sessão não resolveu, a partir de 1500 ms. */
    showLoader: loaderDue && destination === null,
    reducedMotion,
    onExitFinished,
  };
}

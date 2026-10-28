import { useEffect, useRef, useState } from 'react';

import type { RootStackScreenProps } from '../../navigation/types';
import { ApiError } from '../../services/http/errors';
import { motion } from '../../theme';
import { loadMeOnBoot } from '../auth/api/loadMeOnBoot';
import { useLogout } from '../auth/useLogout';

type BootErrorNavigation = Pick<
  RootStackScreenProps<'BootError'>['navigation'],
  'reset'
>;

/**
 * Erro de rede na abertura (01-design.md, 3.7). TENTAR DE NOVO refaz o `/me`
 * como a splash (sem retry, com o timeout dela) e decide o destino: abas ou
 * sem aluno. Falhou de novo: fica aqui e treme (4.8). 401: o interceptor
 * encerra a sessão e o RootStack leva ao Login. SAIR funciona offline.
 */
export function useBootErrorViewModel(navigation: BootErrorNavigation) {
  const { logout, loggingOut } = useLogout();
  const [retrying, setRetrying] = useState(false);
  const [failures, setFailures] = useState(0);
  const inFlight = useRef<AbortController | null>(null);

  useEffect(() => () => inFlight.current?.abort(), []);

  const onRetry = async () => {
    if (inFlight.current) return;
    const controller = new AbortController();
    inFlight.current = controller;
    setRetrying(true);
    try {
      const me = await loadMeOnBoot({
        timeoutMs: motion.splash.meTimeout,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      navigation.reset({
        index: 0,
        routes: [
          me.students.length > 0
            ? { name: 'App', params: { screen: 'Agenda' } }
            : { name: 'NoStudent' },
        ],
      });
    } catch (error) {
      const kind = error instanceof ApiError ? error.kind : 'unknown';
      if (kind === 'canceled' || kind === 'unauthorized') return;
      setRetrying(false);
      setFailures(count => count + 1);
    } finally {
      if (inFlight.current === controller) inFlight.current = null;
    }
  };

  return {
    onRetry,
    retrying,
    /** Muda a cada retry que falha: dispara o shake do ErrorState. */
    shakeKey: failures,
    onLogout: logout,
    logoutDisabled: loggingOut,
  };
}

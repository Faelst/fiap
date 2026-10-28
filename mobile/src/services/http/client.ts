import axios from 'axios';
import { Platform } from 'react-native';
import Config from 'react-native-config';

import { useSessionStore } from '../../stores/session.store';
import { logger } from '../logger';
import { secureStorage } from '../storage/secureStorage';
import { resolveApiUrl } from './apiUrl';
import { attachInterceptors } from './interceptors';

const TIMEOUT_MS = 15_000;

export const http = axios.create({
  baseURL: resolveApiUrl(Config.API_URL, Platform.OS),
  timeout: TIMEOUT_MS,
  headers: { Accept: 'application/json' },
});

/** Um 401 por vez encerra a sessão; os outros esperam o mesmo signOut. */
let expiringSession: Promise<void> | null = null;

/**
 * Só encerra a sessão se o 401 veio do token em uso agora. Um 401 atrasado
 * de um request da sessão anterior (o usuário já entrou de novo) é ignorado.
 */
async function expireSession(requestToken: string | null): Promise<void> {
  const currentToken = await secureStorage.getToken();
  const { status, signOut } = useSessionStore.getState();
  if (
    status !== 'signedIn' ||
    requestToken === null ||
    requestToken !== currentToken
  ) {
    return expiringSession ?? undefined;
  }
  if (!expiringSession) {
    logger.info('sessão expirada: voltando ao login');
    expiringSession = signOut('expired').finally(() => {
      expiringSession = null;
    });
  }
  return expiringSession;
}

attachInterceptors(http, {
  getToken: secureStorage.getToken,
  onUnauthorized: expireSession,
  logger,
});

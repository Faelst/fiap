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

function expireSession(): Promise<void> {
  const { status, signOut } = useSessionStore.getState();
  if (status !== 'signedIn') {
    return expiringSession ?? Promise.resolve();
  }
  if (!expiringSession) {
    logger.warn('sessão expirada: voltando ao login');
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

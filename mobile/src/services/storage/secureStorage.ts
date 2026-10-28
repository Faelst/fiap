import * as Keychain from 'react-native-keychain';

import { logger } from '../logger';
import { mmkv } from './mmkv';

const SERVICE = 'br.com.fiap.school.session';
const USERNAME = 'session';

/**
 * Marcas no mmkv, que some quando o app é desinstalado (o keychain do iOS,
 * não). `INSTALLED`: sem ela, o token do keychain é de uma instalação
 * anterior e é apagado. `PENDING_CLEAR`: o logout não conseguiu apagar o
 * token; ele não vale até ser apagado ou trocado por um novo login.
 */
const INSTALLED_KEY = 'secureStorage.installed';
const PENDING_CLEAR_KEY = 'secureStorage.pendingClear';

export type SecureStorage = {
  /** Lê o keychain e atualiza a memória (abertura do app). */
  loadToken: () => Promise<string | null>;
  /** Token da memória; vai ao keychain só na primeira vez. */
  getToken: () => Promise<string | null>;
  setToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
};

/**
 * O JWT mora só no Keychain (iOS) / Keystore (Android). A cópia em memória
 * evita uma ida ao keychain por request e some quando o app fecha.
 */
export function createSecureStorage(): SecureStorage {
  let cached: string | null | undefined;

  /** Apaga o token do keychain; devolve se conseguiu. */
  const resetKeychain = async () => {
    try {
      await Keychain.resetGenericPassword({ service: SERVICE });
      return true;
    } catch (error) {
      logger.error('secureStorage: falha ao apagar o token', { error });
      return false;
    }
  };

  const loadToken = async () => {
    if (!mmkv.getBoolean(INSTALLED_KEY)) {
      cached = null;
      if (await resetKeychain()) mmkv.set(INSTALLED_KEY, true);
      return cached;
    }
    if (mmkv.getBoolean(PENDING_CLEAR_KEY)) {
      cached = null;
      if (await resetKeychain()) mmkv.remove(PENDING_CLEAR_KEY);
      return cached;
    }
    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE,
      });
      cached = credentials ? credentials.password : null;
    } catch (error) {
      logger.warn('secureStorage: falha ao ler o token', { error });
      cached = null;
    }
    return cached;
  };

  return {
    loadToken,

    async getToken() {
      return cached !== undefined ? cached : loadToken();
    },

    async setToken(token) {
      await Keychain.setGenericPassword(USERNAME, token, {
        service: SERVICE,
        accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      });
      cached = token;
      mmkv.set(INSTALLED_KEY, true);
      mmkv.remove(PENDING_CLEAR_KEY);
    },

    async clearToken() {
      cached = null;
      if (!(await resetKeychain())) mmkv.set(PENDING_CLEAR_KEY, true);
    },
  };
}

export const secureStorage = createSecureStorage();

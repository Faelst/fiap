/** Keychain em memória para os testes (mesma forma da API do react-native-keychain). */
const store = new Map<string, { username: string; password: string }>();

const DEFAULT_SERVICE = 'default';

export const ACCESSIBLE = {
  WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
  AFTER_FIRST_UNLOCK: 'AccessibleAfterFirstUnlock',
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY:
    'AccessibleAfterFirstUnlockThisDeviceOnly',
};

export const setGenericPassword = jest.fn(
  async (
    username: string,
    password: string,
    options?: { service?: string },
  ) => {
    const service = options?.service ?? DEFAULT_SERVICE;
    store.set(service, { username, password });
    return { service, storage: 'keychain' };
  },
);

export const getGenericPassword = jest.fn(
  async (options?: { service?: string }) => {
    const entry = store.get(options?.service ?? DEFAULT_SERVICE);
    return entry ? { ...entry, service: options?.service } : false;
  },
);

export const resetGenericPassword = jest.fn(
  async (options?: { service?: string }) =>
    store.delete(options?.service ?? DEFAULT_SERVICE),
);

/** Só para os testes: zera o keychain falso. */
export const __reset = () => store.clear();

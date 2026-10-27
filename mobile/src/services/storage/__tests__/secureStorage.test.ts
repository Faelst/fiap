import * as Keychain from 'react-native-keychain';

import { createSecureStorage } from '../secureStorage';

describe('secureStorage', () => {
  let secureStorage = createSecureStorage();
  beforeEach(() => {
    secureStorage = createSecureStorage();
  });

  it('começa sem token', async () => {
    expect(await secureStorage.getToken()).toBeNull();
  });

  it('grava o token no keychain e lê de volta', async () => {
    await secureStorage.setToken('jwt-1');

    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'session',
      'jwt-1',
      expect.objectContaining({
        service: 'br.com.fiap.school.session',
        accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      }),
    );
    secureStorage = createSecureStorage(); // app reaberto: memória vazia
    expect(await secureStorage.getToken()).toBe('jwt-1');
  });

  it('guarda o token em memória para não ir ao keychain a cada request', async () => {
    await secureStorage.setToken('jwt-1');
    (Keychain.getGenericPassword as jest.Mock).mockClear();

    expect(await secureStorage.getToken()).toBe('jwt-1');
    expect(Keychain.getGenericPassword).not.toHaveBeenCalled();
  });

  it('apaga o token do keychain e da memória', async () => {
    await secureStorage.setToken('jwt-1');
    await secureStorage.clearToken();

    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: 'br.com.fiap.school.session',
    });
    expect(await secureStorage.getToken()).toBeNull();
    secureStorage = createSecureStorage(); // app reaberto: memória vazia
    expect(await secureStorage.getToken()).toBeNull();
  });

  it('loadToken relê o keychain mesmo com cópia em memória', async () => {
    expect(await secureStorage.getToken()).toBeNull();
    await createSecureStorage().setToken('jwt-de-outra-sessao');

    expect(await secureStorage.loadToken()).toBe('jwt-de-outra-sessao');
    expect(await secureStorage.getToken()).toBe('jwt-de-outra-sessao');
  });

  it('devolve null se o keychain falhar na leitura', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('keychain indisponível'),
    );
    expect(await secureStorage.getToken()).toBeNull();
  });
});

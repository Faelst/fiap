import * as Keychain from 'react-native-keychain';

import { logger } from '../../logger';
import { mmkv } from '../mmkv';
import { createSecureStorage } from '../secureStorage';

const SERVICE = 'br.com.fiap.school.session';

/** Token que ficou no keychain de uma instalação anterior (iOS). */
const leftoverToken = (token: string) =>
  Keychain.setGenericPassword('session', token, { service: SERVICE });

const keychainToken = async () => {
  const entry = await Keychain.getGenericPassword({ service: SERVICE });
  return entry ? entry.password : null;
};

describe('secureStorage', () => {
  let secureStorage = createSecureStorage();
  beforeEach(() => {
    mmkv.clearAll();
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
    await secureStorage.loadToken(); // primeira abertura já passou
    secureStorage = createSecureStorage();
    (Keychain.getGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('keychain indisponível'),
    );
    expect(await secureStorage.getToken()).toBeNull();
  });

  describe('primeira abertura depois de instalar (iOS guarda o keychain após desinstalar)', () => {
    it('sem a marca de instalação, apaga o token que sobrou e devolve null', async () => {
      await leftoverToken('jwt-da-instalacao-anterior');

      expect(await secureStorage.loadToken()).toBeNull();
      expect(await keychainToken()).toBeNull();
    });

    it('grava a marca: a abertura seguinte lê o keychain normalmente', async () => {
      await secureStorage.loadToken();
      await leftoverToken('jwt-novo');

      expect(await createSecureStorage().loadToken()).toBe('jwt-novo');
    });

    it('se apagar falhar, não usa o token e tenta de novo na próxima abertura', async () => {
      await leftoverToken('jwt-da-instalacao-anterior');
      (Keychain.resetGenericPassword as jest.Mock).mockRejectedValueOnce(
        new Error('keychain indisponível'),
      );

      expect(await secureStorage.loadToken()).toBeNull();
      expect(await createSecureStorage().loadToken()).toBeNull();
      expect(await keychainToken()).toBeNull();
    });
  });

  describe('falha ao apagar o token no logout', () => {
    beforeEach(async () => {
      await secureStorage.setToken('jwt-1');
      (Keychain.resetGenericPassword as jest.Mock).mockRejectedValueOnce(
        new Error('keychain indisponível'),
      );
    });

    it('registra como erro, sem o token', async () => {
      const error = jest.spyOn(logger, 'error');

      await secureStorage.clearToken();

      expect(error).toHaveBeenCalledWith(
        'secureStorage: falha ao apagar o token',
        expect.anything(),
      );
      expect(JSON.stringify(error.mock.calls)).not.toContain('jwt-1');
      error.mockRestore();
    });

    it('a sessão não volta na próxima abertura, e o token é apagado nela', async () => {
      await secureStorage.clearToken();

      expect(await createSecureStorage().loadToken()).toBeNull();
      expect(await keychainToken()).toBeNull();
    });

    it('um novo login vale normalmente', async () => {
      await secureStorage.clearToken();
      await secureStorage.setToken('jwt-2');

      expect(await createSecureStorage().loadToken()).toBe('jwt-2');
    });
  });
});

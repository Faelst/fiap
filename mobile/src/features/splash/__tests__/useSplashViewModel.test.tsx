import { act, renderHook } from '@testing-library/react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { ApiError } from '../../../services/http/errors';
import { useBootStore } from '../../../stores/boot.store';
import { useSessionStore } from '../../../stores/session.store';
import { meResponse, meWithoutStudents } from '../../../test/fixtures';
import { loadMeOnBoot } from '../../auth/api/loadMeOnBoot';
import { useSplashViewModel } from '../useSplashViewModel';

jest.mock('react-native-reanimated', () => ({
  ...require('react-native-reanimated/mock'),
  useReducedMotion: jest.fn(() => false),
}));

jest.mock('../../auth/api/loadMeOnBoot', () => ({
  loadMeOnBoot: jest.fn(),
}));

const loadMe = jest.mocked(loadMeOnBoot);
const reducedMotion = jest.mocked(useReducedMotion);

/** Promessa que só termina quando o signal é abortado (API pendurada). */
const hangUntilAborted = ({ signal }: { signal?: AbortSignal }) =>
  new Promise<never>((_resolve, reject) => {
    signal?.addEventListener('abort', () => reject(new ApiError('canceled')));
  });

const setup = async () => {
  const navigation = { reset: jest.fn() };
  const hook = await renderHook(() => useSplashViewModel(navigation));
  return { ...hook, navigation };
};

const advance = (ms: number) =>
  act(async () => {
    await jest.advanceTimersByTimeAsync(ms);
  });

describe('useSplashViewModel', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    loadMe.mockReset();
    reducedMotion.mockReturnValue(false);
    useSessionStore.setState({ status: 'loading' });
    useBootStore.setState({ splashDone: false });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sem token vai para o Login só depois da duração mínima (1200 ms)', async () => {
    useSessionStore.setState({ status: 'signedOut' });
    const { result } = await setup();

    await advance(1199);
    expect(result.current.destination).toBeNull();

    await advance(1);
    expect(result.current.destination).toBe('login');
    expect(loadMe).not.toHaveBeenCalled();
  });

  it('espera o bootstrap do keychain antes de decidir', async () => {
    const { result } = await setup();

    await advance(400);
    await act(() => useSessionStore.setState({ status: 'signedOut' }));
    await advance(800);

    expect(result.current.destination).toBe('login');
  });

  it('com token valida o /me com timeout de 8 s e vai para as abas quando há aluno', async () => {
    useSessionStore.setState({ status: 'signedIn' });
    loadMe.mockResolvedValue(meResponse);
    const { result } = await setup();

    await advance(1200);

    expect(result.current.destination).toBe('app');
    expect(loadMe).toHaveBeenCalledTimes(1);
    expect(loadMe).toHaveBeenCalledWith(
      expect.objectContaining({ timeoutMs: 8000 }),
    );
  });

  it('com token e /me sem aluno vai para NoStudent', async () => {
    useSessionStore.setState({ status: 'signedIn' });
    loadMe.mockResolvedValue(meWithoutStudents);
    const { result } = await setup();

    await advance(1200);

    expect(result.current.destination).toBe('noStudent');
  });

  it.each(['network', 'server', 'invalidResponse', 'forbidden'] as const)(
    'erro %s no /me vai para BootError',
    async kind => {
      useSessionStore.setState({ status: 'signedIn' });
      loadMe.mockRejectedValue(new ApiError(kind));
      const { result } = await setup();

      await advance(1200);

      expect(result.current.destination).toBe('bootError');
    },
  );

  it('/me 401 vai para o Login', async () => {
    useSessionStore.setState({ status: 'signedIn' });
    loadMe.mockRejectedValue(new ApiError('unauthorized', { status: 401 }));
    const { result } = await setup();

    await advance(1200);

    expect(result.current.destination).toBe('login');
  });

  it('/me lento: decide quando a resposta chega, depois do mínimo', async () => {
    useSessionStore.setState({ status: 'signedIn' });
    loadMe.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => resolve(meResponse), 3000);
        }),
    );
    const { result } = await setup();

    await advance(2999);
    expect(result.current.destination).toBeNull();

    await advance(1);
    expect(result.current.destination).toBe('app');
  });

  it('canceled não é erro de tela: não vai para BootError na hora', async () => {
    useSessionStore.setState({ status: 'signedIn' });
    loadMe.mockRejectedValue(new ApiError('canceled'));
    const { result } = await setup();

    await advance(5000);

    expect(result.current.destination).toBeNull();
  });

  it('trava de 10 s com token: vai para BootError e cancela o /me', async () => {
    useSessionStore.setState({ status: 'signedIn' });
    let signal: AbortSignal | undefined;
    loadMe.mockImplementation(options => {
      signal = options.signal;
      return hangUntilAborted(options);
    });
    const { result } = await setup();

    await advance(9999);
    expect(result.current.destination).toBeNull();

    await advance(1);
    expect(result.current.destination).toBe('bootError');
    expect(signal?.aborted).toBe(true);
  });

  it('trava de 10 s sem token (keychain não respondeu): vai para o Login', async () => {
    const { result } = await setup();

    await advance(9999);
    expect(result.current.destination).toBeNull();

    await advance(1);
    expect(result.current.destination).toBe('login');
  });

  it('com reduzir movimento a duração mínima é 600 ms', async () => {
    reducedMotion.mockReturnValue(true);
    useSessionStore.setState({ status: 'signedOut' });
    const { result } = await setup();

    await advance(599);
    expect(result.current.destination).toBeNull();

    await advance(1);
    expect(result.current.destination).toBe('login');
    expect(result.current.reducedMotion).toBe(true);
  });

  it('desmontar antes de decidir cancela o /me e não navega', async () => {
    useSessionStore.setState({ status: 'signedIn' });
    let signal: AbortSignal | undefined;
    loadMe.mockImplementation(options => {
      signal = options.signal;
      return hangUntilAborted(options);
    });
    const { unmount, navigation } = await setup();

    await advance(500);
    await act(async () => unmount());
    await advance(10_000);

    expect(signal?.aborted).toBe(true);
    expect(navigation.reset).not.toHaveBeenCalled();
  });

  describe('loop de espera', () => {
    it('aparece em 1500 ms se a sessão ainda não resolveu', async () => {
      useSessionStore.setState({ status: 'signedIn' });
      loadMe.mockImplementation(hangUntilAborted);
      const { result } = await setup();

      await advance(1499);
      expect(result.current.showLoader).toBe(false);

      await advance(1);
      expect(result.current.showLoader).toBe(true);
    });

    it('não aparece quando o destino sai no mínimo', async () => {
      useSessionStore.setState({ status: 'signedOut' });
      const { result } = await setup();

      await advance(3000);

      expect(result.current.destination).toBe('login');
      expect(result.current.showLoader).toBe(false);
    });

    it('some quando a sessão resolve depois dele', async () => {
      useSessionStore.setState({ status: 'signedIn' });
      loadMe.mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve(meResponse), 2500);
          }),
      );
      const { result } = await setup();

      await advance(1500);
      expect(result.current.showLoader).toBe(true);

      await advance(1000);
      expect(result.current.destination).toBe('app');
      expect(result.current.showLoader).toBe(false);
    });
  });

  describe('fim da saída', () => {
    it('Login: reset com fromSplash e a splash sai do stack', async () => {
      useSessionStore.setState({ status: 'signedOut' });
      const { result, navigation } = await setup();
      await advance(1200);

      await act(() => result.current.onExitFinished());

      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Login', params: { fromSplash: true } }],
      });
      expect(useBootStore.getState().splashDone).toBe(true);
    });

    it.each([
      [meResponse, 'App', { screen: 'Agenda', fromSplash: true }],
      [meWithoutStudents, 'NoStudent', { fromSplash: true }],
    ] as const)('/me ok: reset para %#', async (me, name, params) => {
      useSessionStore.setState({ status: 'signedIn' });
      loadMe.mockResolvedValue(me);
      const { result, navigation } = await setup();
      await advance(1200);

      await act(() => result.current.onExitFinished());

      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name, params }],
      });
    });

    it('BootError: reset para BootError', async () => {
      useSessionStore.setState({ status: 'signedIn' });
      loadMe.mockRejectedValue(new ApiError('network'));
      const { result, navigation } = await setup();
      await advance(1200);

      await act(() => result.current.onExitFinished());

      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'BootError', params: { fromSplash: true } }],
      });
    });

    it('sem destino ainda, não navega', async () => {
      useSessionStore.setState({ status: 'signedOut' });
      const { result, navigation } = await setup();

      await act(() => result.current.onExitFinished());

      expect(navigation.reset).not.toHaveBeenCalled();
      expect(useBootStore.getState().splashDone).toBe(false);
    });
  });
});

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';

import { queryClient, queryKeys } from '../../../app/queryClient';
import {
  createSecureStorage,
  secureStorage,
} from '../../../services/storage/secureStorage';
import { useSessionStore } from '../../../stores/session.store';
import { API_URL, meResponse, meWithoutStudents } from '../../../test/fixtures';
import { server } from '../../../test/msw/server';
import { QueryWrapper } from '../../../test/queryWrapper';
import { useBootErrorViewModel } from '../useBootErrorViewModel';

describe('useBootErrorViewModel', () => {
  const reset = jest.fn();

  beforeEach(async () => {
    reset.mockClear();
    await useSessionStore.getState().signOut();
    // O mesmo storage do client http: o request sai com este token.
    await secureStorage.setToken('jwt-salvo');
    useSessionStore.setState({ status: 'signedIn', signOutReason: null });
    queryClient.clear();
  });

  const renderBootError = () =>
    renderHook(() => useBootErrorViewModel({ reset }), {
      wrapper: QueryWrapper,
    });

  it('TENTAR DE NOVO com aluno: refaz o /me, guarda no cache e vai às abas', async () => {
    const { result } = await renderBootError();

    await act(() => result.current.onRetry());

    expect(reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'App', params: { screen: 'Agenda' } }],
    });
    expect(queryClient.getQueryData(queryKeys.me())).toEqual(meResponse);
  });

  it('TENTAR DE NOVO sem aluno vai para o NoStudent', async () => {
    server.use(
      http.get(`${API_URL}/me`, () => HttpResponse.json(meWithoutStudents)),
    );
    const { result } = await renderBootError();

    await act(() => result.current.onRetry());

    expect(reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'NoStudent' }],
    });
  });

  it('fica carregando durante o request e ignora um 2º toque', async () => {
    let calls = 0;
    let respond: () => void = () => {};
    server.use(
      http.get(`${API_URL}/me`, async () => {
        calls += 1;
        await new Promise<void>(resolve => {
          respond = resolve;
        });
        return HttpResponse.json(meResponse);
      }),
    );
    const { result } = await renderBootError();

    expect(result.current.retrying).toBe(false);
    let first: Promise<void> = Promise.resolve();
    await act(async () => {
      first = result.current.onRetry();
    });
    expect(result.current.retrying).toBe(true);
    await act(async () => {
      result.current.onRetry();
    });
    await waitFor(() => expect(calls).toBe(1));

    await act(async () => {
      respond();
      await first;
    });
    expect(calls).toBe(1);
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('falhou de novo: fica na tela, para de carregar e dispara o shake', async () => {
    server.use(http.get(`${API_URL}/me`, () => HttpResponse.error()));
    const { result } = await renderBootError();
    expect(result.current.shakeKey).toBe(0);

    await act(() => result.current.onRetry());

    expect(reset).not.toHaveBeenCalled();
    expect(result.current.retrying).toBe(false);
    expect(result.current.shakeKey).toBe(1);

    await act(() => result.current.onRetry());
    expect(result.current.shakeKey).toBe(2);
  });

  it('401 no retry: a sessão expira (o RootStack leva ao Login) e não navega daqui', async () => {
    server.use(
      http.get(`${API_URL}/me`, () =>
        HttpResponse.json(
          { statusCode: 401, message: 'Unauthorized' },
          { status: 401 },
        ),
      ),
    );
    const { result } = await renderBootError();

    await act(() => result.current.onRetry());

    expect(reset).not.toHaveBeenCalled();
    expect(useSessionStore.getState()).toMatchObject({
      status: 'signedOut',
      signOutReason: 'expired',
    });
  });

  it('SAIR encerra a sessão mesmo offline', async () => {
    server.use(http.get(`${API_URL}/me`, () => HttpResponse.error()));
    const { result } = await renderBootError();

    await act(() => result.current.onLogout());

    expect(useSessionStore.getState().status).toBe('signedOut');
    expect(await createSecureStorage().getToken()).toBeNull();
  });

  it('sair da tela no meio do retry cancela o request e não navega', async () => {
    server.use(
      http.get(`${API_URL}/me`, async () => {
        await new Promise<void>(resolve => {
          setTimeout(resolve, 50);
        });
        return HttpResponse.json(meResponse);
      }),
    );
    const { result, unmount } = await renderBootError();

    let pending: Promise<void> = Promise.resolve();
    await act(async () => {
      pending = result.current.onRetry();
    });
    await unmount();
    await pending;

    expect(reset).not.toHaveBeenCalled();
  });
});

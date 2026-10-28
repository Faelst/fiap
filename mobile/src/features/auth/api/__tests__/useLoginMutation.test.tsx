import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Keychain from 'react-native-keychain';
import { http, HttpResponse } from 'msw';

import { queryClient, queryKeys } from '../../../../app/queryClient';
import { createSecureStorage } from '../../../../services/storage/secureStorage';
import { useSessionStore } from '../../../../stores/session.store';
import { API_URL, loginResponse, meResponse } from '../../../../test/fixtures';
import { server } from '../../../../test/msw/server';
import { QueryWrapper } from '../../../../test/queryWrapper';
import { useLoginMutation } from '../useLoginMutation';

describe('useLoginMutation', () => {
  beforeEach(async () => {
    await useSessionStore.getState().signOut();
    queryClient.clear();
  });

  it('200: manda o CPF só com dígitos e abre a sessão com o token', async () => {
    let body: unknown;
    server.use(
      http.post(`${API_URL}/auth/login`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(loginResponse);
      }),
    );
    const { result } = await renderHook(() => useLoginMutation(), {
      wrapper: QueryWrapper,
    });

    await act(() =>
      result.current.mutateAsync({ cpf: '969.294.560-04', password: '123456' }),
    );

    expect(body).toEqual({ cpf: '96929456004', password: '123456' });
    const state = useSessionStore.getState();
    expect(state.status).toBe('signedIn');
    expect(state.guardian).toEqual(loginResponse.guardian);
    expect(await createSecureStorage().getToken()).toBe('jwt-gustavo');
  });

  it('não guarda CPF e senha no cache de mutations depois que o Login sai', async () => {
    const { result, unmount } = await renderHook(() => useLoginMutation(), {
      wrapper: QueryWrapper,
    });
    await act(() =>
      result.current.mutateAsync({ cpf: '969.294.560-04', password: '123456' }),
    );
    expect(queryClient.getMutationCache().getAll()).toHaveLength(1);

    await unmount();

    await waitFor(() =>
      expect(queryClient.getMutationCache().getAll()).toHaveLength(0),
    );
  });

  it('401: erro unauthorized com a mensagem da API e sessão fechada', async () => {
    const { result } = await renderHook(() => useLoginMutation(), {
      wrapper: QueryWrapper,
    });

    await act(async () => {
      result.current.mutate({ cpf: '969.294.560-04', password: 'errada' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({
      kind: 'unauthorized',
      apiMessage: 'Usuário ou senha inválida.',
    });
    expect(useSessionStore.getState().status).toBe('signedOut');
    expect(await createSecureStorage().getToken()).toBeNull();
  });

  it('falha ao gravar no keychain vira erro storage com mensagem amigável', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (Keychain.setGenericPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Keystore bloqueado'),
    );
    const { result } = await renderHook(() => useLoginMutation(), {
      wrapper: QueryWrapper,
    });

    await act(async () => {
      result.current.mutate({ cpf: '969.294.560-04', password: '123456' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.kind).toBe('storage');
    expect(result.current.error?.message).toBe(
      'Não foi possível salvar o acesso neste aparelho. Tente de novo.',
    );
    expect(useSessionStore.getState().status).toBe('signedOut');
    expect(queryClient.getQueryData(queryKeys.me())).toBeUndefined();
  });

  it('resposta sem token é tratada como invalidResponse e não abre sessão', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json({ guardian: loginResponse.guardian }),
      ),
    );
    const { result } = await renderHook(() => useLoginMutation(), {
      wrapper: QueryWrapper,
    });

    await act(async () => {
      result.current.mutate({ cpf: '969.294.560-04', password: '123456' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.kind).toBe('invalidResponse');
    expect(useSessionStore.getState().status).toBe('signedOut');
  });

  it('busca o /me com o token novo e guarda no cache antes de abrir a sessão', async () => {
    let authorization: string | null = null;
    server.use(
      http.get(`${API_URL}/me`, ({ request }) => {
        authorization = request.headers.get('authorization');
        return HttpResponse.json(meResponse);
      }),
    );
    let meWhenSignedIn: unknown;
    const unsubscribe = useSessionStore.subscribe(state => {
      if (state.status === 'signedIn' && meWhenSignedIn === undefined) {
        meWhenSignedIn = queryClient.getQueryData(queryKeys.me());
      }
    });
    const { result } = await renderHook(() => useLoginMutation(), {
      wrapper: QueryWrapper,
    });

    await act(() =>
      result.current.mutateAsync({ cpf: '969.294.560-04', password: '123456' }),
    );
    unsubscribe();

    expect(authorization).toBe('Bearer jwt-gustavo');
    expect(meWhenSignedIn).toEqual(meResponse);
  });

  it('/me que falha depois do login: erro de rede, sem sessão e sem token', async () => {
    server.use(http.get(`${API_URL}/me`, () => HttpResponse.error()));
    const { result } = await renderHook(() => useLoginMutation(), {
      wrapper: QueryWrapper,
    });

    await act(async () => {
      result.current.mutate({ cpf: '969.294.560-04', password: '123456' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.kind).toBe('network');
    expect(useSessionStore.getState().status).toBe('signedOut');
    expect(await createSecureStorage().getToken()).toBeNull();
  });
});

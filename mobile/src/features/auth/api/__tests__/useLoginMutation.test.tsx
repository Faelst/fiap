import { act, renderHook, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';

import { queryClient } from '../../../../app/queryClient';
import { createSecureStorage } from '../../../../services/storage/secureStorage';
import { useSessionStore } from '../../../../stores/session.store';
import { API_URL, loginResponse } from '../../../../test/fixtures';
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
});

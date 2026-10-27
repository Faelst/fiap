import { renderHook, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';

import { queryClient } from '../../../../app/queryClient';
import { useSessionStore } from '../../../../stores/session.store';
import {
  API_URL,
  loginResponse,
  meResponse,
  meWithoutStudents,
} from '../../../../test/fixtures';
import { server } from '../../../../test/msw/server';
import { QueryWrapper } from '../../../../test/queryWrapper';
import { useMeQuery } from '../useMeQuery';

const render = () => renderHook(() => useMeQuery(), { wrapper: QueryWrapper });

describe('useMeQuery', () => {
  beforeEach(async () => {
    await useSessionStore.getState().signOut();
    queryClient.clear();
  });

  afterEach(() => jest.restoreAllMocks());

  it('sem sessão não chama a API', async () => {
    const { result } = await render();
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('200: devolve o responsável e os alunos validados', async () => {
    await useSessionStore.getState().signIn('jwt-1', loginResponse.guardian);
    const { result } = await render();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(meResponse);
  });

  it('responsável sem aluno: students vazio, sem erro', async () => {
    await useSessionStore.getState().signIn('jwt-1', loginResponse.guardian);
    server.use(
      http.get(`${API_URL}/me`, () => HttpResponse.json(meWithoutStudents)),
    );
    const { result } = await render();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.students).toEqual([]);
  });

  it('401: encerra a sessão como expirada', async () => {
    await useSessionStore.getState().signIn('jwt-1', loginResponse.guardian);
    server.use(
      http.get(`${API_URL}/me`, () =>
        HttpResponse.json({ statusCode: 401 }, { status: 401 }),
      ),
    );
    await render();

    await waitFor(() =>
      expect(useSessionStore.getState().status).toBe('signedOut'),
    );
    expect(useSessionStore.getState().signOutReason).toBe('expired');
  });

  it('resposta fora do contrato vira erro tratado, sem crash e sem retry', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await useSessionStore.getState().signIn('jwt-1', loginResponse.guardian);
    let calls = 0;
    server.use(
      http.get(`${API_URL}/me`, () => {
        calls += 1;
        return HttpResponse.json({ ...meResponse, students: 'nenhum' });
      }),
    );
    const { result } = await render();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.kind).toBe('invalidResponse');
    expect(calls).toBe(1);
    expect(useSessionStore.getState().status).toBe('signedIn');
  });
});

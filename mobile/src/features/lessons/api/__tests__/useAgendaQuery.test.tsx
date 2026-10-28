import { renderHook, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';

import { queryClient } from '../../../../app/queryClient';
import { useSessionStore } from '../../../../stores/session.store';
import { agendaResponse, API_URL } from '../../../../test/fixtures';
import { server } from '../../../../test/msw/server';
import { QueryWrapper } from '../../../../test/queryWrapper';
import { useAgendaQuery } from '../useAgendaQuery';

describe('useAgendaQuery', () => {
  beforeEach(async () => {
    queryClient.clear();
    await useSessionStore.getState().signIn('jwt-1');
  });

  it('sem aluno selecionado não chama a API', async () => {
    const { result } = await renderHook(() => useAgendaQuery(null), {
      wrapper: QueryWrapper,
    });
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('busca a agenda do aluno e guarda no cache por aluno', async () => {
    const requested: string[] = [];
    server.use(
      http.get(`${API_URL}/students/:id/agenda`, ({ params }) => {
        requested.push(String(params.id));
        return HttpResponse.json(agendaResponse);
      }),
    );
    const { result, rerender } = await renderHook(
      ({ id }: { id: string }) => useAgendaQuery(id),
      { wrapper: QueryWrapper, initialProps: { id: 's1' } },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(7);

    await rerender({ id: 's2' });
    // Espera o hook receber a resposta do s2, e não só o request sair: senão
    // ela chega depois do último `waitFor` e atualiza o hook fora do act.
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requested).toEqual(['s1', 's2']);
    expect(queryClient.getQueryData(['agenda', 's1'])).toHaveLength(7);
  });

  it('403 (aluno de outro responsável) vira erro forbidden', async () => {
    server.use(
      http.get(`${API_URL}/students/:id/agenda`, () =>
        HttpResponse.json({ statusCode: 403 }, { status: 403 }),
      ),
    );
    const { result } = await renderHook(() => useAgendaQuery('outro'), {
      wrapper: QueryWrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.kind).toBe('forbidden');
  });
});

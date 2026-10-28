import { renderHook, waitFor } from '@testing-library/react-native';

import { queryClient } from '../../../../app/queryClient';
import { useSessionStore } from '../../../../stores/session.store';
import { reportCard2025, reportCardsResponse } from '../../../../test/fixtures';
import { QueryWrapper } from '../../../../test/queryWrapper';
import { useReportCardQuery } from '../useReportCardQuery';
import { useReportCardsQuery } from '../useReportCardsQuery';

describe('boletim', () => {
  beforeEach(async () => {
    queryClient.clear();
    await useSessionStore.getState().signIn('jwt-1');
  });

  it('useReportCardsQuery lista os anos do aluno', async () => {
    const { result } = await renderHook(() => useReportCardsQuery('s1'), {
      wrapper: QueryWrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(reportCardsResponse);
  });

  it('useReportCardQuery traz o boletim do ano', async () => {
    const { result } = await renderHook(() => useReportCardQuery('s1', 2025), {
      wrapper: QueryWrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(reportCard2025);
    expect(queryClient.getQueryData(['reportCard', 's1', 2025])).toEqual(
      reportCard2025,
    );
  });

  it('ano sem boletim → notFound', async () => {
    const { result } = await renderHook(() => useReportCardQuery('s1', 2019), {
      wrapper: QueryWrapper,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.kind).toBe('notFound');
  });

  it('sem aluno ou sem ano não chama a API', async () => {
    const { result: semAluno } = await renderHook(
      () => useReportCardQuery(null, 2025),
      { wrapper: QueryWrapper },
    );
    const { result: semAno } = await renderHook(
      () => useReportCardQuery('s1', null),
      { wrapper: QueryWrapper },
    );
    const { result: lista } = await renderHook(
      () => useReportCardsQuery(null),
      { wrapper: QueryWrapper },
    );
    expect(semAluno.current.fetchStatus).toBe('idle');
    expect(semAno.current.fetchStatus).toBe('idle');
    expect(lista.current.fetchStatus).toBe('idle');
  });
});

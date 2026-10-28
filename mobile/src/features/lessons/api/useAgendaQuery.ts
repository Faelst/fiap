import { skipToken, useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../app/queryClient';
import { getAgenda } from '../services/lessons.service';

/** Agenda da semana do aluno. Sem aluno, a query fica parada. */
export function useAgendaQuery(studentId: string | null) {
  return useQuery({
    queryKey: queryKeys.agenda(studentId ?? ''),
    queryFn: studentId
      ? ({ signal }) => getAgenda(studentId, signal)
      : skipToken,
  });
}

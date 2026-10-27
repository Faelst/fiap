import { skipToken, useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../app/queryClient';
import { getReportCards } from '../services/reportCard.service';

/** Anos com boletim do aluno, do mais recente para o mais antigo. */
export function useReportCardsQuery(studentId: string | null) {
  return useQuery({
    queryKey: queryKeys.reportCards(studentId ?? ''),
    queryFn: studentId ? () => getReportCards(studentId) : skipToken,
  });
}

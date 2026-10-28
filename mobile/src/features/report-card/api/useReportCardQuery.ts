import { skipToken, useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../../app/queryClient';
import { getReportCard } from '../services/reportCard.service';

/** Boletim de um ano (notas e faltas por trimestre). */
export function useReportCardQuery(
  studentId: string | null,
  year: number | null,
) {
  return useQuery({
    queryKey: queryKeys.reportCard(studentId ?? '', year ?? 0),
    queryFn:
      studentId && year !== null
        ? ({ signal }) => getReportCard(studentId, year, signal)
        : skipToken,
  });
}

import { http } from '../../../services/http/client';
import { parseResponse } from '../../../services/http/parseResponse';
import {
  reportCardSchema,
  reportCardsSchema,
  type ReportCard,
  type ReportCardSummary,
} from '../schemas';

const studentPath = (studentId: string) =>
  `/students/${encodeURIComponent(studentId)}/report-cards`;

export async function getReportCards(
  studentId: string,
  signal?: AbortSignal,
): Promise<ReportCardSummary[]> {
  const { data } = await http.get(studentPath(studentId), { signal });
  return parseResponse(
    reportCardsSchema,
    data,
    'GET /students/:id/report-cards',
  );
}

export async function getReportCard(
  studentId: string,
  year: number,
  signal?: AbortSignal,
): Promise<ReportCard> {
  const { data } = await http.get(`${studentPath(studentId)}/${year}`, {
    signal,
  });
  return parseResponse(
    reportCardSchema,
    data,
    'GET /students/:id/report-cards/:year',
  );
}

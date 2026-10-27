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
): Promise<ReportCardSummary[]> {
  const { data } = await http.get(studentPath(studentId));
  return parseResponse(
    reportCardsSchema,
    data,
    'GET /students/:id/report-cards',
  );
}

export async function getReportCard(
  studentId: string,
  year: number,
): Promise<ReportCard> {
  const { data } = await http.get(`${studentPath(studentId)}/${year}`);
  return parseResponse(
    reportCardSchema,
    data,
    'GET /students/:id/report-cards/:year',
  );
}

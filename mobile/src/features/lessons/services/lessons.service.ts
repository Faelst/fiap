import { http } from '../../../services/http/client';
import { parseResponse } from '../../../services/http/parseResponse';
import { agendaSchema, type Agenda } from '../schemas';

export async function getAgenda(studentId: string): Promise<Agenda> {
  const { data } = await http.get(
    `/students/${encodeURIComponent(studentId)}/agenda`,
  );
  return parseResponse(agendaSchema, data, 'GET /students/:id/agenda');
}

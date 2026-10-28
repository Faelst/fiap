import { http, HttpResponse } from 'msw';

import {
  agendaResponse,
  API_URL,
  invalidCredentials,
  loginResponse,
  meResponse,
  reportCard2025,
  reportCardsResponse,
} from '../fixtures';

/** Caminho feliz da API. Cada teste troca o que precisa com `server.use`. */
export const handlers = [
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { cpf: string; password: string };
    if (body.cpf === '96929456004' && body.password === '123456') {
      return HttpResponse.json(loginResponse);
    }
    return HttpResponse.json(invalidCredentials, { status: 401 });
  }),
  http.get(`${API_URL}/me`, () => HttpResponse.json(meResponse)),
  http.get(`${API_URL}/students/:id/agenda`, () =>
    HttpResponse.json(agendaResponse),
  ),
  http.get(`${API_URL}/students/:id/report-cards`, () =>
    HttpResponse.json(reportCardsResponse),
  ),
  http.get(`${API_URL}/students/:id/report-cards/:year`, ({ params }) =>
    params.year === '2025'
      ? HttpResponse.json(reportCard2025)
      : HttpResponse.json(
          { statusCode: 404, message: 'Not Found', error: 'Not Found' },
          { status: 404 },
        ),
  ),
];

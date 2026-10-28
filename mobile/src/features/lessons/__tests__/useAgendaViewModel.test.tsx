import { act, renderHook, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';

import { queryClient, queryKeys } from '../../../app/queryClient';
import { createSecureStorage } from '../../../services/storage/secureStorage';
import { useSessionStore } from '../../../stores/session.store';
import { agendaResponse, API_URL, meResponse } from '../../../test/fixtures';
import { server } from '../../../test/msw/server';
import { QueryWrapper } from '../../../test/queryWrapper';
import { motion } from '../../../theme';
import { useAgendaViewModel } from '../useAgendaViewModel';

// 25/10/2026 é domingo; 27/10/2026, terça.
const at = (day: number) => () => new Date(2026, 9, day, 10, 0);
const TUESDAY = at(27);

/** Agenda da Marina (s2): mesma semana, outras aulas. */
const marinaAgenda = agendaResponse.map(day => ({
  date: day.date,
  lessons: day.lessons.map(lesson => ({ ...lesson, subject: 'Geografia' })),
}));

const agendaById: Record<string, typeof agendaResponse> = {
  s1: agendaResponse,
  s2: marinaAgenda,
};

const serverDown = () =>
  server.use(
    http.get(`${API_URL}/students/:id/agenda`, () => HttpResponse.error()),
  );

describe('useAgendaViewModel', () => {
  beforeAll(() => {
    // Sem a espera de 1 s entre as tentativas: o retry continua acontecendo.
    queryClient.setQueryDefaults(['agenda'], { retryDelay: 0 });
  });

  afterAll(() => {
    queryClient.setQueryDefaults(['agenda'], {});
  });

  beforeEach(async () => {
    await useSessionStore.getState().signOut();
    await createSecureStorage().setToken('jwt-salvo');
    useSessionStore.setState({ status: 'signedIn', selectedStudentId: 's1' });
    queryClient.clear();
    queryClient.setQueryData(queryKeys.me(), meResponse);
    server.use(
      http.get(`${API_URL}/students/:id/agenda`, ({ params }) =>
        HttpResponse.json(agendaById[String(params.id)]),
      ),
    );
  });

  const renderAgenda = (now = TUESDAY) =>
    renderHook(() => useAgendaViewModel({ now }), { wrapper: QueryWrapper });

  const renderReady = async (now = TUESDAY) => {
    const rendered = await renderAgenda(now);
    await waitFor(() => expect(rendered.result.current.status).toBe('ready'));
    return rendered;
  };

  it('carregando enquanto a agenda não chegou', async () => {
    const { result } = await renderAgenda();

    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });

  it.each([
    [25, '2025-03-16'],
    [26, '2025-03-17'],
    [27, '2025-03-18'],
    [28, '2025-03-19'],
    [29, '2025-03-20'],
    [30, '2025-03-21'],
    [31, '2025-03-22'],
  ])(
    'hoje dia %i/10/2026 abre em %s (mesmo dia da semana, D35)',
    async (day, expected) => {
      const { result } = await renderReady(at(day));

      expect(result.current.selectedDate).toBe(expected);
    },
  );

  it('lista os 7 dias da agenda como "17 de março, segunda-feira"', async () => {
    const { result } = await renderReady();

    expect(result.current.dayOptions).toEqual([
      { key: '2025-03-16', label: '16 de março, domingo' },
      { key: '2025-03-17', label: '17 de março, segunda-feira' },
      { key: '2025-03-18', label: '18 de março, terça-feira' },
      { key: '2025-03-19', label: '19 de março, quarta-feira' },
      { key: '2025-03-20', label: '20 de março, quinta-feira' },
      { key: '2025-03-21', label: '21 de março, sexta-feira' },
      { key: '2025-03-22', label: '22 de março, sábado' },
    ]);
    expect(result.current.selectedDayLabel).toBe('18 de março, terça-feira');
  });

  it('mostra as aulas do dia selecionado, na ordem da API', async () => {
    const { result } = await renderReady(at(26));

    expect(result.current.lessons).toEqual([
      {
        key: '2025-03-17-0',
        startTime: '07:15',
        endTime: '08:00',
        subject: 'Matemática I',
      },
      {
        key: '2025-03-17-1',
        startTime: '08:15',
        endTime: '09:00',
        subject: 'Língua Inglesa',
      },
    ]);
    expect(result.current.isEmpty).toBe(false);
  });

  it('trocar de dia mostra as aulas do novo dia', async () => {
    const { result } = await renderReady();

    await act(() => result.current.onSelectDay('2025-03-17'));

    expect(result.current.selectedDate).toBe('2025-03-17');
    expect(result.current.selectedDayLabel).toBe('17 de março, segunda-feira');
    expect(result.current.lessons.map(lesson => lesson.subject)).toEqual([
      'Matemática I',
      'Língua Inglesa',
    ]);
  });

  it('domingo (lessons: []) fica vazio', async () => {
    const { result } = await renderReady();

    await act(() => result.current.onSelectDay('2025-03-16'));

    expect(result.current.lessons).toEqual([]);
    expect(result.current.isEmpty).toBe(true);
  });

  it('contentKey muda com o dia e com o aluno (a lista entra de novo)', async () => {
    const { result } = await renderReady();
    expect(result.current.contentKey).toBe('s1:2025-03-18');

    await act(() => result.current.onSelectDay('2025-03-17'));
    expect(result.current.contentKey).toBe('s1:2025-03-17');

    await act(() => useSessionStore.getState().selectStudent('s2'));
    await waitFor(() =>
      expect(result.current.contentKey).toBe('s2:2025-03-18'),
    );
  });

  it('dia que não está na agenda é ignorado', async () => {
    const { result } = await renderReady();

    await act(() => result.current.onSelectDay('2030-01-01'));

    expect(result.current.selectedDate).toBe('2025-03-18');
  });

  it('trocar de aluno volta ao dia inicial, com a agenda do novo aluno', async () => {
    const { result } = await renderReady();
    await act(() => result.current.onSelectDay('2025-03-17'));

    await act(() => useSessionStore.getState().selectStudent('s2'));
    await waitFor(() =>
      expect(result.current.lessons[0]?.subject).toBe('Geografia'),
    );
    expect(result.current.selectedDate).toBe('2025-03-18');

    await act(() => useSessionStore.getState().selectStudent('s1'));
    await waitFor(() =>
      expect(result.current.lessons[0]?.subject).toBe(
        'Produção e Interpretação de Textos',
      ),
    );
    expect(result.current.selectedDate).toBe('2025-03-18');
  });

  it('API fora do ar: erro, sem dias e sem aulas', async () => {
    serverDown();

    const { result } = await renderAgenda();

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.dayOptions).toEqual([]);
    expect(result.current.lessons).toEqual([]);
    expect(result.current.retrying).toBe(false);
    expect(result.current.shakeKey).toBe(0);
  });

  it('TENTAR DE NOVO busca de novo e mostra a agenda quando a API volta', async () => {
    serverDown();
    const { result } = await renderAgenda();
    await waitFor(() => expect(result.current.status).toBe('error'));

    let release = () => {};
    const apiBack = new Promise<void>(resolve => {
      release = resolve;
    });
    server.use(
      http.get(`${API_URL}/students/:id/agenda`, async () => {
        await apiBack;
        return HttpResponse.json(agendaResponse);
      }),
    );
    let retry: Promise<void> = Promise.resolve();
    await act(() => {
      retry = result.current.onRetry();
    });

    expect(result.current.retrying).toBe(true);
    expect(result.current.status).toBe('error');

    release();
    await act(() => retry);
    expect(result.current.status).toBe('ready');
    expect(result.current.retrying).toBe(false);
    expect(result.current.selectedDate).toBe('2025-03-18');
  });

  it('TENTAR DE NOVO que falha de novo continua no erro e muda o shakeKey', async () => {
    serverDown();
    const { result } = await renderAgenda();
    await waitFor(() => expect(result.current.status).toBe('error'));

    await act(() => result.current.onRetry());

    await waitFor(() => expect(result.current.retrying).toBe(false));
    expect(result.current.status).toBe('error');
    expect(result.current.shakeKey).toBe(1);
  });
  it('agenda sem dias ([]) fica vazia, sem dias para escolher', async () => {
    server.use(
      http.get(`${API_URL}/students/:id/agenda`, () => HttpResponse.json([])),
    );

    const { result } = await renderReady();

    expect(result.current.dayOptions).toEqual([]);
    expect(result.current.selectedDate).toBeNull();
    expect(result.current.isEmpty).toBe(true);
  });

  it('a 1ª lista espera a entrada do header (4 × stagger); as seguintes, não', async () => {
    const { result } = await renderReady();
    expect(result.current.contentEnterDelay).toBe(4 * motion.stagger);

    await act(() => result.current.onSelectDay('2025-03-17'));
    expect(result.current.contentEnterDelay).toBe(0);

    // Voltar ao dia da 1ª exibição não repete o atraso.
    await act(() => result.current.onSelectDay('2025-03-18'));
    expect(result.current.contentEnterDelay).toBe(0);
  });

  it('trocar de aluno durante o TENTAR DE NOVO não leva o spinner nem o shake ao outro aluno', async () => {
    let releaseRafael = () => {};
    const rafaelRetry = new Promise<void>(resolve => {
      releaseRafael = resolve;
    });
    let rafaelCalls = 0;
    server.use(
      http.get(`${API_URL}/students/:id/agenda`, async ({ params }) => {
        if (params.id === 's1') {
          rafaelCalls += 1;
          if (rafaelCalls > 2) await rafaelRetry;
          return HttpResponse.error();
        }
        return new Promise<never>(() => {});
      }),
    );
    const { result } = await renderAgenda();
    await waitFor(() => expect(result.current.status).toBe('error'));

    let retry: Promise<void> = Promise.resolve();
    await act(() => {
      retry = result.current.onRetry();
    });
    expect(result.current.retrying).toBe(true);

    await act(() => useSessionStore.getState().selectStudent('s2'));
    expect(result.current.retrying).toBe(false);
    expect(result.current.status).toBe('loading');

    releaseRafael();
    await act(() => retry);
    expect(result.current.status).toBe('loading');
    expect(result.current.shakeKey).toBe(0);
  });
});

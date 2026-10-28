import { ThemeProvider } from '@shopify/restyle';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useIsFocused } from '@react-navigation/native';
import { http, HttpResponse } from 'msw';
import { AccessibilityInfo } from 'react-native';

import { queryClient, queryKeys } from '../../../app/queryClient';
import { createSecureStorage } from '../../../services/storage/secureStorage';
import { useSessionStore } from '../../../stores/session.store';
import { agendaResponse, API_URL, meResponse } from '../../../test/fixtures';
import { mockMeasureInWindow } from '../../../test/measureInWindow';
import { server } from '../../../test/msw/server';
import { QueryWrapper } from '../../../test/queryWrapper';
import { theme } from '../../../theme';
import { LessonsScreen } from '../LessonsScreen';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
  useIsFocused: jest.fn(() => true),
}));

const deferred = () => {
  let release = () => {};
  const promise = new Promise<void>(resolve => {
    release = resolve;
  });
  return { promise, release };
};

describe('LessonsScreen', () => {
  beforeAll(() => {
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
    mockMeasureInWindow({ x: 24, y: 300, width: 366, height: 45 });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  /** "Hoje" numa segunda (D35: a Agenda abre em 17/03, com o domingo ao lado). */
  const onMonday = () =>
    jest.useFakeTimers({
      now: new Date(2026, 9, 26, 6, 0),
      advanceTimers: true,
    });

  const renderScreen = () =>
    render(
      <QueryWrapper>
        <ThemeProvider theme={theme}>
          <LessonsScreen />
        </ThemeProvider>
      </QueryWrapper>,
    );

  const chooseDay = async (date: string) => {
    await fireEvent.press(await screen.findByTestId(`agenda-day-${date}`));
  };

  it('o fim da rolagem fica acima da tab bar flutuante (N1)', async () => {
    onMonday();
    await renderScreen();

    const { floatingTabBar } = theme.sizes;
    // Sem home indicator: barra (64) + `m` da borda + `m` de folga.
    const inset = floatingTabBar.height + 2 * theme.spacing.m;
    expect(
      (await screen.findByTestId('agenda-page-2025-03-17')).props
        .contentContainerStyle,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ paddingBottom: inset }),
      ]),
    );
  });

  it('header compacto com o título Agenda e o chip do aluno; skeleton enquanto a agenda carrega', async () => {
    const gate = deferred();
    server.use(
      http.get(`${API_URL}/students/:id/agenda`, async () => {
        await gate.promise;
        return HttpResponse.json(agendaResponse);
      }),
    );
    await renderScreen();

    expect(screen.getByTestId('agenda-screen')).toBeOnTheScreen();
    expect(screen.getByTestId('agenda-title')).toHaveTextContent('Agenda');
    expect(screen.getByTestId('agenda-title')).toHaveProp(
      'accessibilityRole',
      'header',
    );
    expect(screen.getByTestId('header-greeting')).toHaveTextContent(
      'Olá, Gustavo',
    );
    expect(screen.getByTestId('header-student-chip')).toBeOnTheScreen();
    expect(screen.getByTestId('agenda-skeleton')).toBeOnTheScreen();
    expect(screen.queryByTestId('agenda-week-strip')).toBeNull();

    gate.release();
    expect(await screen.findByTestId('agenda-week-strip')).toBeOnTheScreen();
    expect(screen.queryByTestId('agenda-skeleton')).toBeNull();
  });

  it('segunda: a grade mostra as aulas com horário e disciplina, na ordem', async () => {
    onMonday();
    await renderScreen();

    await chooseDay('2025-03-17');

    expect(screen.getByTestId('agenda-day-2025-03-17')).toBeSelected();
    expect(
      screen.getByTestId('agenda-page-2025-03-17-timetable'),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId('agenda-page-2025-03-17-lesson-0-time'),
    ).toHaveTextContent('07:15 – 08:00 · 45 min');
    expect(
      screen.getByTestId('agenda-page-2025-03-17-lesson-0-subject'),
    ).toHaveTextContent('Matemática I');
    expect(
      screen.getByTestId('agenda-page-2025-03-17-lesson-1-subject'),
    ).toHaveTextContent('Língua Inglesa');
    expect(screen.queryByTestId('agenda-page-2025-03-17-lesson-2')).toBeNull();
  });

  it('domingo: ícone e "Sem aulas neste dia", sem grade', async () => {
    onMonday();
    await renderScreen();

    await chooseDay('2025-03-16');

    expect(
      screen.getByTestId('agenda-page-2025-03-16-empty'),
    ).toHaveTextContent(/Sem aulas neste dia/);
    expect(screen.queryByTestId('agenda-page-2025-03-16-timetable')).toBeNull();
  });

  it('API fora do ar: erro sem faixa; TENTAR DE NOVO traz a agenda', async () => {
    server.use(
      http.get(`${API_URL}/students/:id/agenda`, () => HttpResponse.error()),
    );
    await renderScreen();

    expect(await screen.findByTestId('agenda-error')).toHaveTextContent(
      /Não foi possível carregar a agenda\./,
    );
    expect(screen.queryByTestId('agenda-week-strip')).toBeNull();

    server.use(
      http.get(`${API_URL}/students/:id/agenda`, () =>
        HttpResponse.json(agendaResponse),
      ),
    );
    await fireEvent.press(screen.getByTestId('agenda-error-retry'));

    expect(await screen.findByTestId('agenda-week-strip')).toBeOnTheScreen();
    expect(screen.queryByTestId('agenda-error')).toBeNull();
  });
  it('agenda sem dias: "Nenhuma aula nesta semana", sem faixa vazia', async () => {
    server.use(
      http.get(`${API_URL}/students/:id/agenda`, () => HttpResponse.json([])),
    );
    await renderScreen();

    expect(await screen.findByTestId('agenda-week-empty')).toHaveTextContent(
      'Nenhuma aula nesta semana',
    );
    expect(screen.queryByTestId('agenda-week-strip')).toBeNull();
  });

  describe('anúncio do erro só com a aba em foco (3.8)', () => {
    const announce = AccessibilityInfo.announceForAccessibility as jest.Mock;
    const focused = useIsFocused as jest.Mock;

    beforeEach(() => {
      announce.mockClear();
      server.use(
        http.get(`${API_URL}/students/:id/agenda`, () => HttpResponse.error()),
      );
    });
    afterEach(() => focused.mockReturnValue(true));

    it('aba escondida (montada, fora de foco) não anuncia o erro', async () => {
      focused.mockReturnValue(false);
      await renderScreen();

      expect(await screen.findByTestId('agenda-error')).toBeOnTheScreen();
      expect(announce).not.toHaveBeenCalled();
    });

    it('aba em foco anuncia o erro uma vez', async () => {
      await renderScreen();

      expect(await screen.findByTestId('agenda-error')).toBeOnTheScreen();
      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce.mock.calls[0][0]).toMatch(
        /^Não foi possível carregar a agenda\./,
      );
    });
  });
});

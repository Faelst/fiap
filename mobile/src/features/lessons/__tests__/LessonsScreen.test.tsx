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

  afterEach(() => jest.restoreAllMocks());

  const renderScreen = () =>
    render(
      <QueryWrapper>
        <ThemeProvider theme={theme}>
          <LessonsScreen />
        </ThemeProvider>
      </QueryWrapper>,
    );

  const chooseDay = async (date: string) => {
    await fireEvent.press(await screen.findByTestId('agenda-day-dropdown'));
    await fireEvent.press(
      screen.getByTestId(`agenda-day-dropdown-option-${date}`),
    );
  };

  it('o fim da rolagem fica acima da tab bar flutuante (N1)', async () => {
    await renderScreen();

    const { floatingTabBar } = theme.sizes;
    // Sem home indicator: barra (64) + `m` da borda + `m` de folga.
    const inset = floatingTabBar.height + 2 * theme.spacing.m;
    expect(
      screen.getByTestId('agenda-scroll').props.contentContainerStyle,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ paddingBottom: inset }),
      ]),
    );
    await screen.findByTestId('agenda-day-dropdown');
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
    expect(screen.queryByTestId('agenda-day-dropdown')).toBeNull();

    gate.release();
    expect(await screen.findByTestId('agenda-day-dropdown')).toBeOnTheScreen();
    expect(screen.queryByTestId('agenda-skeleton')).toBeNull();
  });

  it('segunda: lista as aulas com horário e disciplina, na ordem', async () => {
    await renderScreen();

    await chooseDay('2025-03-17');

    expect(screen.getByTestId('agenda-day-dropdown-label')).toHaveTextContent(
      '17 de março, segunda-feira',
    );
    expect(screen.getByTestId('agenda-lesson-list')).toBeOnTheScreen();
    expect(screen.getByTestId('agenda-lesson-0-time')).toHaveTextContent(
      '07:15 - 08:00',
    );
    expect(screen.getByTestId('agenda-lesson-0-subject')).toHaveTextContent(
      'Matemática I',
    );
    expect(screen.getByTestId('agenda-lesson-1-subject')).toHaveTextContent(
      'Língua Inglesa',
    );
    expect(screen.queryByTestId('agenda-lesson-2')).toBeNull();
    expect(screen.queryByTestId('agenda-empty')).toBeNull();
  });

  it('domingo: ícone e "Sem aulas neste dia", sem lista', async () => {
    await renderScreen();

    await chooseDay('2025-03-16');

    expect(screen.getByTestId('agenda-empty')).toHaveTextContent(
      'Sem aulas neste dia',
    );
    expect(
      screen.getByTestId('agenda-empty-icon', {
        includeHiddenElements: true,
      }),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId('agenda-lesson-list')).toBeNull();
  });

  it('API fora do ar: erro sem dropdown; TENTAR DE NOVO traz a agenda', async () => {
    server.use(
      http.get(`${API_URL}/students/:id/agenda`, () => HttpResponse.error()),
    );
    await renderScreen();

    expect(await screen.findByTestId('agenda-error')).toHaveTextContent(
      /Não foi possível carregar a agenda\./,
    );
    expect(screen.queryByTestId('agenda-day-dropdown')).toBeNull();

    server.use(
      http.get(`${API_URL}/students/:id/agenda`, () =>
        HttpResponse.json(agendaResponse),
      ),
    );
    await fireEvent.press(screen.getByTestId('agenda-error-retry'));

    expect(await screen.findByTestId('agenda-day-dropdown')).toBeOnTheScreen();
    expect(screen.queryByTestId('agenda-error')).toBeNull();
  });
  it('agenda sem dias: "Sem aulas neste dia", sem dropdown vazio', async () => {
    server.use(
      http.get(`${API_URL}/students/:id/agenda`, () => HttpResponse.json([])),
    );
    await renderScreen();

    expect(await screen.findByTestId('agenda-empty')).toHaveTextContent(
      'Sem aulas neste dia',
    );
    expect(screen.queryByTestId('agenda-day-dropdown')).toBeNull();
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

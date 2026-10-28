import { ThemeProvider } from '@shopify/restyle';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';

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

  it('título AGENDA e skeleton enquanto a agenda carrega', async () => {
    const gate = deferred();
    server.use(
      http.get(`${API_URL}/students/:id/agenda`, async () => {
        await gate.promise;
        return HttpResponse.json(agendaResponse);
      }),
    );
    await renderScreen();

    expect(screen.getByTestId('agenda-screen')).toBeOnTheScreen();
    expect(screen.getByTestId('agenda-title')).toHaveTextContent('AGENDA');
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

  it('domingo: ilustração e "Sem aulas neste dia", sem lista', async () => {
    await renderScreen();

    await chooseDay('2025-03-16');

    expect(screen.getByTestId('agenda-empty')).toHaveTextContent(
      'Sem aulas neste dia',
    );
    expect(
      screen.getByTestId('agenda-empty-illustration', {
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
});

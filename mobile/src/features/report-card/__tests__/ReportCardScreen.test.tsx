import { ThemeProvider } from '@shopify/restyle';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useIsFocused } from '@react-navigation/native';
import { http, HttpResponse } from 'msw';
import { AccessibilityInfo } from 'react-native';

import { queryClient, queryKeys } from '../../../app/queryClient';
import { createSecureStorage } from '../../../services/storage/secureStorage';
import { useSessionStore } from '../../../stores/session.store';
import {
  API_URL,
  meResponse,
  reportCard2024,
  reportCard2025,
  reportCardsResponse,
} from '../../../test/fixtures';
import { mockMeasureInWindow } from '../../../test/measureInWindow';
import { server } from '../../../test/msw/server';
import { QueryWrapper } from '../../../test/queryWrapper';
import { theme } from '../../../theme';
import { ReportCardScreen } from '../ReportCardScreen';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
  useIsFocused: jest.fn(() => true),
}));

const listPath = `${API_URL}/students/:id/report-cards`;
const yearPath = `${API_URL}/students/:id/report-cards/:year`;

const reports: Record<string, object> = {
  '2025': reportCard2025,
  '2024': reportCard2024,
};

const deferred = () => {
  let release = () => {};
  const promise = new Promise<void>(resolve => {
    release = resolve;
  });
  return { promise, release };
};

describe('ReportCardScreen', () => {
  beforeAll(() => {
    queryClient.setQueryDefaults(['reportCards'], { retryDelay: 0 });
    queryClient.setQueryDefaults(['reportCard'], { retryDelay: 0 });
  });

  afterAll(() => {
    queryClient.setQueryDefaults(['reportCards'], {});
    queryClient.setQueryDefaults(['reportCard'], {});
  });

  beforeEach(async () => {
    await useSessionStore.getState().signOut();
    await createSecureStorage().setToken('jwt-salvo');
    useSessionStore.setState({ status: 'signedIn', selectedStudentId: 's1' });
    queryClient.clear();
    queryClient.setQueryData(queryKeys.me(), meResponse);
    mockMeasureInWindow({ x: 16, y: 300, width: 382, height: 45 });
    server.use(
      http.get(yearPath, ({ params }) =>
        HttpResponse.json(reports[String(params.year)]),
      ),
    );
  });

  afterEach(() => jest.restoreAllMocks());

  const renderScreen = () =>
    render(
      <QueryWrapper>
        <ThemeProvider theme={theme}>
          <ReportCardScreen />
        </ThemeProvider>
      </QueryWrapper>,
    );

  const press = (testID: string) => fireEvent.press(screen.getByTestId(testID));

  it('header compacto com o título Boletim e skeleton enquanto carrega; depois "7EF - 2025" e os 3 trimestres fechados', async () => {
    const gate = deferred();
    server.use(
      http.get(listPath, async () => {
        await gate.promise;
        return HttpResponse.json(reportCardsResponse);
      }),
    );
    await renderScreen();

    expect(screen.getByTestId('boletim-screen')).toBeOnTheScreen();
    expect(screen.getByTestId('boletim-title')).toHaveTextContent('Boletim');
    expect(screen.getByTestId('header-student-chip')).toBeOnTheScreen();
    expect(screen.getByTestId('boletim-scroll')).toBeOnTheScreen();
    expect(screen.getByTestId('boletim-skeleton')).toBeOnTheScreen();
    expect(screen.queryByTestId('boletim-year-dropdown')).toBeNull();

    gate.release();
    expect(
      await screen.findByTestId('boletim-year-dropdown-label'),
    ).toHaveTextContent('7EF - 2025');
    expect(await screen.findByTestId('boletim-term-1')).toHaveTextContent(
      '1º TRIMESTRE',
    );
    expect(screen.getByTestId('boletim-term-2')).toHaveTextContent(
      '2º TRIMESTRE',
    );
    expect(screen.getByTestId('boletim-term-3')).toHaveTextContent(
      '3º TRIMESTRE',
    );
    for (const term of [1, 2, 3]) {
      expect(screen.getByTestId(`boletim-term-${term}`)).not.toBeExpanded();
    }
    expect(screen.queryByTestId('boletim-skeleton')).toBeNull();
  });

  it('dropdown de turma e ano com o rótulo e a dica do leitor de tela', async () => {
    await renderScreen();

    const dropdown = await screen.findByTestId('boletim-year-dropdown');
    expect(dropdown).toHaveAccessibleName('Turma e ano: 7EF - 2025');
    expect(dropdown).toHaveProp(
      'accessibilityHint',
      'Toque para ver outros anos',
    );
  });

  it('abrir o 1º trimestre e Língua Portuguesa mostra Nota 9,5 e Faltas 0', async () => {
    await renderScreen();
    await screen.findByTestId('boletim-term-1');

    await press('boletim-term-1');
    expect(screen.getByTestId('boletim-term-1')).toBeExpanded();
    expect(screen.getByTestId('boletim-term-1-subject-0')).toHaveTextContent(
      'Língua Portuguesa',
    );

    await press('boletim-term-1-subject-0');
    expect(screen.getByTestId('boletim-term-1-subject-0')).toBeExpanded();
    expect(
      screen.getByTestId('boletim-term-1-subject-0-grade', {
        includeHiddenElements: true,
      }),
    ).toHaveTextContent('9,5');
    expect(
      screen.getByTestId('boletim-term-1-subject-0-absences', {
        includeHiddenElements: true,
      }),
    ).toHaveTextContent('0');
  });

  it('2º trimestre não avaliado: Nota "-" e Faltas "-"', async () => {
    await renderScreen();
    await screen.findByTestId('boletim-term-2');

    await press('boletim-term-2');
    await press('boletim-term-2-subject-0');

    expect(
      screen.getByTestId('boletim-term-2-subject-0-grade', {
        includeHiddenElements: true,
      }),
    ).toHaveTextContent('-');
    expect(
      screen.getByTestId('boletim-term-2-subject-0-absences', {
        includeHiddenElements: true,
      }),
    ).toHaveTextContent('-');
  });

  it('trocar para 6EF - 2024 mostra as notas de 2024, com tudo fechado', async () => {
    await renderScreen();
    await screen.findByTestId('boletim-term-1');
    await press('boletim-term-1');

    await press('boletim-year-dropdown');
    await press('boletim-year-dropdown-option-2024');

    expect(screen.getByTestId('boletim-year-dropdown-label')).toHaveTextContent(
      '6EF - 2024',
    );
    expect(await screen.findByTestId('boletim-term-1')).not.toBeExpanded();
    await press('boletim-term-1');
    await press('boletim-term-1-subject-0');
    expect(
      screen.getByTestId('boletim-term-1-subject-0-grade', {
        includeHiddenElements: true,
      }),
    ).toHaveTextContent('7,5');
  });

  it('API fora do ar: erro sem dropdown; TENTAR DE NOVO traz o boletim', async () => {
    server.use(http.get(listPath, () => HttpResponse.error()));
    await renderScreen();

    const error = await screen.findByTestId('boletim-error');
    expect(error).toHaveTextContent(/Não foi possível carregar o boletim\./);
    expect(error).toHaveTextContent(/Confira sua conexão e tente de novo\./);
    expect(screen.queryByTestId('boletim-year-dropdown')).toBeNull();

    server.use(
      http.get(listPath, () => HttpResponse.json(reportCardsResponse)),
    );
    await press('boletim-error-retry');

    expect(await screen.findByTestId('boletim-term-1')).toBeOnTheScreen();
    expect(screen.queryByTestId('boletim-error')).toBeNull();
  });

  it('404 do ano: erro "Boletim não encontrado." com o dropdown na tela', async () => {
    server.use(
      http.get(yearPath, () =>
        HttpResponse.json(
          {
            statusCode: 404,
            message: 'Boletim não encontrado.',
            error: 'Not Found',
          },
          { status: 404 },
        ),
      ),
    );
    await renderScreen();

    expect(await screen.findByTestId('boletim-error')).toHaveTextContent(
      /Boletim não encontrado\./,
    );
    expect(screen.getByTestId('boletim-year-dropdown')).toBeOnTheScreen();
    expect(screen.queryByTestId('boletim-term-1')).toBeNull();
  });

  it('aluno sem boletim: "Nenhum boletim disponível", sem dropdown vazio', async () => {
    server.use(http.get(listPath, () => HttpResponse.json([])));
    await renderScreen();

    expect(await screen.findByTestId('boletim-empty')).toHaveTextContent(
      'Nenhum boletim disponível',
    );
    expect(screen.queryByTestId('boletim-year-dropdown')).toBeNull();
  });

  describe('anúncio do erro só com a aba em foco (3.8)', () => {
    const announce = AccessibilityInfo.announceForAccessibility as jest.Mock;
    const focused = useIsFocused as jest.Mock;

    beforeEach(() => {
      announce.mockClear();
      server.use(http.get(listPath, () => HttpResponse.error()));
    });
    afterEach(() => focused.mockReturnValue(true));

    it('aba escondida (montada, fora de foco) não anuncia o erro', async () => {
      focused.mockReturnValue(false);
      await renderScreen();

      expect(await screen.findByTestId('boletim-error')).toBeOnTheScreen();
      expect(announce).not.toHaveBeenCalled();
    });

    it('aba em foco anuncia o erro uma vez', async () => {
      await renderScreen();

      expect(await screen.findByTestId('boletim-error')).toBeOnTheScreen();
      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce.mock.calls[0][0]).toMatch(
        /^Não foi possível carregar o boletim\./,
      );
    });
  });
});

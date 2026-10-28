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

  it('header compacto com o título Boletim e skeleton enquanto carrega; depois ano, trimestre, resumo e cards', async () => {
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
    expect(screen.queryByTestId('boletim-year')).toBeNull();

    gate.release();
    expect(await screen.findByTestId('boletim-year-2025')).toHaveAccessibleName(
      '2025 · 7EF',
    );
    expect(screen.getByTestId('boletim-year-2025')).toBeSelected();
    expect(await screen.findByTestId('boletim-term-tab-1')).toBeSelected();
    expect(screen.getByTestId('boletim-term-tab-2')).toHaveAccessibleName(
      '2º trimestre',
    );
    expect(screen.getByTestId('boletim-summary')).toHaveAccessibleName(
      '1º trimestre de 2025. Média 8,8, Bom. 2 faltas em 2 disciplinas. 0 abaixo de 7.',
    );
    expect(screen.getByTestId('boletim-legend')).toBeOnTheScreen();
    expect(screen.queryByTestId('boletim-skeleton')).toBeNull();
  });

  it('o card de Língua Portuguesa no 1º trimestre mostra 9,5, Bom e 0 faltas', async () => {
    await renderScreen();

    const card = await screen.findByTestId('boletim-term-1-subject-0');
    expect(card).toHaveAccessibleName(
      'Língua Portuguesa. Nota 9,5, Bom. 0 faltas.',
    );
    const hidden = { includeHiddenElements: true };
    expect(
      screen.getByTestId('boletim-term-1-subject-0-grade', hidden),
    ).toHaveTextContent('9,5');
    expect(
      screen.getByTestId('boletim-term-1-subject-0-band', hidden),
    ).toHaveTextContent('Bom');
    expect(
      screen.getByTestId('boletim-term-1-subject-0-absences', hidden),
    ).toHaveTextContent('0 faltas');
  });

  it('2º trimestre não avaliado: "Ainda não avaliado", sem resumo nem cards', async () => {
    await renderScreen();
    await screen.findByTestId('boletim-term-tab-2');

    await press('boletim-term-tab-2');

    expect(
      await screen.findByTestId('boletim-term-2-not-evaluated'),
    ).toHaveTextContent(/Ainda não avaliado/);
    expect(screen.queryByTestId('boletim-summary')).toBeNull();
    expect(screen.queryByTestId('boletim-term-2-subject-0')).toBeNull();
  });

  it('trocar para 2024 abre no 3º trimestre e mostra as notas de 2024', async () => {
    await renderScreen();
    await screen.findByTestId('boletim-year-2024');

    await press('boletim-year-2024');

    expect(await screen.findByTestId('boletim-term-tab-3')).toBeSelected();
    expect(screen.getByTestId('boletim-year-2024')).toBeSelected();
    await press('boletim-term-tab-1');
    expect(
      await screen.findByTestId('boletim-term-1-subject-0'),
    ).toHaveAccessibleName('Língua Portuguesa. Nota 7,5, Bom. 1 falta.');
  });

  it('API fora do ar: erro sem segmentos; Tentar de novo traz o boletim', async () => {
    server.use(http.get(listPath, () => HttpResponse.error()));
    await renderScreen();

    const error = await screen.findByTestId('boletim-error');
    expect(error).toHaveTextContent(/Não foi possível carregar o boletim\./);
    expect(error).toHaveTextContent(/Confira sua conexão e tente de novo\./);
    expect(screen.queryByTestId('boletim-year')).toBeNull();

    server.use(
      http.get(listPath, () => HttpResponse.json(reportCardsResponse)),
    );
    await press('boletim-error-retry');

    expect(await screen.findByTestId('boletim-summary')).toBeOnTheScreen();
    expect(screen.queryByTestId('boletim-error')).toBeNull();
  });

  it('404 do ano: erro "Boletim não encontrado." com o segmento de ano na tela', async () => {
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
    expect(screen.getByTestId('boletim-year')).toBeOnTheScreen();
    expect(screen.queryByTestId('boletim-summary')).toBeNull();
  });

  it('aluno sem boletim: "Nenhum boletim disponível", sem segmento vazio', async () => {
    server.use(http.get(listPath, () => HttpResponse.json([])));
    await renderScreen();

    expect(await screen.findByTestId('boletim-empty')).toHaveTextContent(
      'Nenhum boletim disponível',
    );
    expect(screen.queryByTestId('boletim-year')).toBeNull();
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

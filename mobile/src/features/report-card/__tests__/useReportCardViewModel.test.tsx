import { act, renderHook, waitFor } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';

import { queryClient, queryKeys } from '../../../app/queryClient';
import { createSecureStorage } from '../../../services/storage/secureStorage';
import { useSessionStore } from '../../../stores/session.store';
import {
  API_URL,
  marinaReportCard2025,
  marinaReportCards,
  meResponse,
  reportCard2024,
  reportCard2025,
  reportCardsResponse,
} from '../../../test/fixtures';
import { server } from '../../../test/msw/server';
import { QueryWrapper } from '../../../test/queryWrapper';
import { motion } from '../../../theme';
import { useReportCardViewModel } from '../useReportCardViewModel';

const yearsById: Record<string, object> = {
  s1: reportCardsResponse,
  s2: marinaReportCards,
};

const reportsById: Record<string, Record<string, object>> = {
  s1: { '2025': reportCard2025, '2024': reportCard2024 },
  s2: { '2025': marinaReportCard2025 },
};

const notFound = {
  statusCode: 404,
  message: 'Boletim não encontrado.',
  error: 'Not Found',
};

const listPath = `${API_URL}/students/:id/report-cards`;
const yearPath = `${API_URL}/students/:id/report-cards/:year`;

const deferred = () => {
  let release = () => {};
  const promise = new Promise<void>(resolve => {
    release = resolve;
  });
  return { promise, release };
};

describe('useReportCardViewModel', () => {
  beforeAll(() => {
    // Sem a espera de 1 s entre as tentativas: o retry continua acontecendo.
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
    server.use(
      http.get(listPath, ({ params }) =>
        HttpResponse.json(yearsById[String(params.id)]),
      ),
      http.get(yearPath, ({ params }) => {
        const report = reportsById[String(params.id)]?.[String(params.year)];
        return report
          ? HttpResponse.json(report)
          : HttpResponse.json(notFound, { status: 404 });
      }),
    );
  });

  const renderBoletim = () =>
    renderHook(() => useReportCardViewModel(), { wrapper: QueryWrapper });

  const renderReady = async () => {
    const rendered = await renderBoletim();
    await waitFor(() =>
      expect(rendered.result.current.termsStatus).toBe('ready'),
    );
    return rendered;
  };

  it('carregando enquanto a lista de anos não chegou', async () => {
    const { result } = await renderBoletim();

    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.termsStatus).toBe('ready'));
    expect(result.current.status).toBe('ready');
  });

  it('abre no ano mais recente (2025), com o rótulo "turma - ano"', async () => {
    const { result } = await renderReady();

    expect(result.current.selectedYearKey).toBe('2025');
    expect(result.current.selectedYearLabel).toBe('7EF - 2025');
    expect(result.current.yearOptions).toEqual([
      { key: '2025', label: '7EF - 2025' },
      { key: '2024', label: '6EF - 2024' },
    ]);
    expect(result.current.isEmpty).toBe(false);
  });

  it('abre no ano mais recente mesmo se a lista não vier em ordem', async () => {
    server.use(
      http.get(listPath, () =>
        HttpResponse.json([...reportCardsResponse].reverse()),
      ),
    );

    const { result } = await renderReady();

    expect(result.current.selectedYearKey).toBe('2025');
  });

  it('mapeia os trimestres e as disciplinas para exibição, todos fechados', async () => {
    const { result } = await renderReady();

    expect(result.current.terms).toHaveLength(3);
    const [first, second] = result.current.terms;
    expect(first).toMatchObject({
      term: 1,
      title: '1º TRIMESTRE',
      accessibilityLabel: '1º trimestre',
      expanded: false,
    });
    expect(first.subjects).toEqual([
      {
        key: '1-0',
        index: 0,
        name: 'Língua Portuguesa',
        grade: '9,5',
        absences: '0',
        resultAccessibilityLabel: 'Nota 9,5, 0 faltas',
        expanded: false,
      },
      {
        key: '1-1',
        index: 1,
        name: 'Matemática',
        grade: '8,0',
        absences: '2',
        resultAccessibilityLabel: 'Nota 8,0, 2 faltas',
        expanded: false,
      },
    ]);
    expect(second.title).toBe('2º TRIMESTRE');
    expect(second.subjects[0]).toMatchObject({
      grade: '-',
      absences: '-',
      resultAccessibilityLabel: 'Nota e faltas ainda não lançadas',
    });
  });

  it('1 falta fica no singular para o leitor de tela', async () => {
    useSessionStore.setState({ selectedStudentId: 's2' });

    const { result } = await renderReady();

    expect(result.current.terms[0].subjects[0].resultAccessibilityLabel).toBe(
      'Nota 6,5, 1 falta',
    );
  });

  it('abre e fecha trimestre e disciplina de forma independente', async () => {
    const { result } = await renderReady();

    await act(() => result.current.onToggleTerm(1));
    await act(() => result.current.onToggleTerm(2));
    await act(() => result.current.onToggleSubject(1, 0));
    await act(() => result.current.onToggleSubject(2, 0));

    const expanded = () =>
      result.current.terms.map(term => ({
        term: term.expanded,
        subjects: term.subjects.map(subject => subject.expanded),
      }));
    expect(expanded()).toEqual([
      { term: true, subjects: [true, false] },
      { term: true, subjects: [true] },
      { term: false, subjects: [false] },
    ]);

    await act(() => result.current.onToggleTerm(1));
    await act(() => result.current.onToggleSubject(2, 0));

    expect(expanded()).toEqual([
      // A disciplina continua aberta dentro do trimestre fechado.
      { term: false, subjects: [true, false] },
      { term: true, subjects: [false] },
      { term: false, subjects: [false] },
    ]);
  });

  it('trocar de ano busca o boletim daquele ano e fecha tudo', async () => {
    const { result } = await renderReady();
    await act(() => result.current.onToggleTerm(1));
    await act(() => result.current.onToggleSubject(1, 0));

    await act(() => result.current.onSelectYear('2024'));

    expect(result.current.selectedYearKey).toBe('2024');
    expect(result.current.selectedYearLabel).toBe('6EF - 2024');
    // A lista fica; só os trimestres carregam.
    expect(result.current.status).toBe('ready');
    expect(result.current.termsStatus).toBe('loading');
    await waitFor(() => expect(result.current.termsStatus).toBe('ready'));
    expect(result.current.terms[0].subjects[0]).toMatchObject({
      grade: '7,5',
      absences: '1',
      expanded: false,
    });
    expect(result.current.terms.every(term => !term.expanded)).toBe(true);
  });

  it('voltar ao ano anterior também fecha tudo', async () => {
    const { result } = await renderReady();
    await act(() => result.current.onSelectYear('2024'));
    await waitFor(() => expect(result.current.termsStatus).toBe('ready'));
    await act(() => result.current.onToggleTerm(2));

    await act(() => result.current.onSelectYear('2025'));

    expect(result.current.termsStatus).toBe('ready');
    expect(result.current.terms.every(term => !term.expanded)).toBe(true);
  });

  it('ano que não está na lista é ignorado', async () => {
    const { result } = await renderReady();

    await act(() => result.current.onSelectYear('2019'));

    expect(result.current.selectedYearKey).toBe('2025');
  });

  it('contentKey muda com o ano e com o aluno (os cards entram de novo)', async () => {
    const { result } = await renderReady();
    expect(result.current.contentKey).toBe('s1:2025');

    await act(() => result.current.onSelectYear('2024'));
    expect(result.current.contentKey).toBe('s1:2024');

    await act(() => useSessionStore.getState().selectStudent('s2'));
    await waitFor(() => expect(result.current.contentKey).toBe('s2:2025'));
  });

  it('trocar de aluno volta ao ano mais recente do novo aluno, tudo fechado', async () => {
    const { result } = await renderReady();
    await act(() => result.current.onSelectYear('2024'));
    await waitFor(() => expect(result.current.termsStatus).toBe('ready'));
    await act(() => result.current.onToggleTerm(1));

    await act(() => useSessionStore.getState().selectStudent('s2'));
    await waitFor(() =>
      expect(result.current.terms[0]?.subjects[0]?.name).toBe('Geografia'),
    );
    expect(result.current.selectedYearLabel).toBe('3EF - 2025');
    expect(result.current.yearOptions).toEqual([
      { key: '2025', label: '3EF - 2025' },
    ]);
    expect(result.current.terms.every(term => !term.expanded)).toBe(true);

    await act(() => useSessionStore.getState().selectStudent('s1'));
    await waitFor(() => expect(result.current.selectedYearKey).toBe('2025'));
    expect(result.current.terms[0].subjects[0].name).toBe('Língua Portuguesa');
  });

  it('a 1ª exibição espera a entrada do header (4 × stagger); as seguintes, não', async () => {
    const { result } = await renderReady();
    expect(result.current.contentEnterDelay).toBe(4 * motion.stagger);

    await act(() => result.current.onSelectYear('2024'));
    await waitFor(() => expect(result.current.termsStatus).toBe('ready'));
    expect(result.current.contentEnterDelay).toBe(0);

    await act(() => result.current.onSelectYear('2025'));
    expect(result.current.contentEnterDelay).toBe(0);
  });

  it('aluno sem boletim: lista vazia, sem anos para escolher', async () => {
    server.use(http.get(listPath, () => HttpResponse.json([])));

    const { result } = await renderBoletim();

    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.yearOptions).toEqual([]);
    expect(result.current.selectedYearKey).toBeNull();
    expect(result.current.terms).toEqual([]);
  });

  describe('erros', () => {
    it('API fora do ar na lista: erro de conexão, sem anos', async () => {
      server.use(http.get(listPath, () => HttpResponse.error()));

      const { result } = await renderBoletim();

      await waitFor(() => expect(result.current.status).toBe('error'));
      expect(result.current.errorDescription).toBe(
        'Confira sua conexão e tente de novo.',
      );
      expect(result.current.yearOptions).toEqual([]);
      expect(result.current.terms).toEqual([]);
      expect(result.current.retrying).toBe(false);
      expect(result.current.shakeKey).toBe(0);
    });

    it('API fora do ar no boletim do ano: a lista fica e os trimestres dão erro', async () => {
      server.use(http.get(yearPath, () => HttpResponse.error()));

      const { result } = await renderBoletim();

      await waitFor(() => expect(result.current.termsStatus).toBe('error'));
      expect(result.current.status).toBe('ready');
      expect(result.current.selectedYearLabel).toBe('7EF - 2025');
      expect(result.current.errorDescription).toBe(
        'Confira sua conexão e tente de novo.',
      );
    });

    it('404 do ano cai no erro com "Boletim não encontrado."', async () => {
      server.use(
        http.get(yearPath, () => HttpResponse.json(notFound, { status: 404 })),
      );

      const { result } = await renderBoletim();

      await waitFor(() => expect(result.current.termsStatus).toBe('error'));
      expect(result.current.errorDescription).toBe('Boletim não encontrado.');
    });

    it('TENTAR DE NOVO na lista mantém o erro com spinner e mostra o boletim quando a API volta', async () => {
      server.use(http.get(listPath, () => HttpResponse.error()));
      const { result } = await renderBoletim();
      await waitFor(() => expect(result.current.status).toBe('error'));

      const gate = deferred();
      server.use(
        http.get(listPath, async () => {
          await gate.promise;
          return HttpResponse.json(reportCardsResponse);
        }),
      );
      let retry: Promise<void> = Promise.resolve();
      await act(() => {
        retry = result.current.onRetry();
      });

      expect(result.current.retrying).toBe(true);
      expect(result.current.status).toBe('error');

      gate.release();
      await act(() => retry);
      expect(result.current.retrying).toBe(false);
      expect(result.current.status).toBe('ready');
      await waitFor(() => expect(result.current.termsStatus).toBe('ready'));
      expect(result.current.selectedYearKey).toBe('2025');
    });

    it('TENTAR DE NOVO no boletim do ano mantém o erro com spinner até a resposta', async () => {
      server.use(http.get(yearPath, () => HttpResponse.error()));
      const { result } = await renderBoletim();
      await waitFor(() => expect(result.current.termsStatus).toBe('error'));

      const gate = deferred();
      server.use(
        http.get(yearPath, async () => {
          await gate.promise;
          return HttpResponse.json(reportCard2025);
        }),
      );
      let retry: Promise<void> = Promise.resolve();
      await act(() => {
        retry = result.current.onRetry();
      });

      expect(result.current.retrying).toBe(true);
      expect(result.current.termsStatus).toBe('error');

      gate.release();
      await act(() => retry);
      expect(result.current.retrying).toBe(false);
      expect(result.current.termsStatus).toBe('ready');
      expect(result.current.terms[0].subjects[0].grade).toBe('9,5');
    });

    it('durante o TENTAR DE NOVO do 404, a descrição continua "Boletim não encontrado."', async () => {
      server.use(
        http.get(yearPath, () => HttpResponse.json(notFound, { status: 404 })),
      );
      const { result } = await renderBoletim();
      await waitFor(() => expect(result.current.termsStatus).toBe('error'));

      const gate = deferred();
      server.use(
        http.get(yearPath, async () => {
          await gate.promise;
          return HttpResponse.json(notFound, { status: 404 });
        }),
      );
      let retry: Promise<void> = Promise.resolve();
      await act(() => {
        retry = result.current.onRetry();
      });

      expect(result.current.retrying).toBe(true);
      expect(result.current.errorDescription).toBe('Boletim não encontrado.');

      gate.release();
      await act(() => retry);
      expect(result.current.termsStatus).toBe('error');
      expect(result.current.errorDescription).toBe('Boletim não encontrado.');
    });

    it('TENTAR DE NOVO que falha de novo continua no erro e muda o shakeKey', async () => {
      server.use(http.get(listPath, () => HttpResponse.error()));
      const { result } = await renderBoletim();
      await waitFor(() => expect(result.current.status).toBe('error'));

      await act(() => result.current.onRetry());

      await waitFor(() => expect(result.current.retrying).toBe(false));
      expect(result.current.status).toBe('error');
      expect(result.current.shakeKey).toBe(1);
    });

    it('trocar de aluno no erro zera o spinner e o shake', async () => {
      server.use(
        http.get(listPath, ({ params }) =>
          params.id === 's1'
            ? HttpResponse.error()
            : new Promise<never>(() => {}),
        ),
      );
      const { result } = await renderBoletim();
      await waitFor(() => expect(result.current.status).toBe('error'));
      await act(() => result.current.onRetry());
      await waitFor(() => expect(result.current.shakeKey).toBe(1));

      await act(() => useSessionStore.getState().selectStudent('s2'));

      expect(result.current.status).toBe('loading');
      expect(result.current.retrying).toBe(false);
      expect(result.current.shakeKey).toBe(0);
    });
  });
});

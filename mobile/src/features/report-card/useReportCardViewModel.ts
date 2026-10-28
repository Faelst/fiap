import { useState } from 'react';

import type { SegmentOption } from '../../components/SegmentedControl';
import { strings } from '../../constants/strings';
import { motion } from '../../theme';
import {
  averageGrade,
  formatGrade,
  GRADE_TARGET,
  gradeBand,
  type GradeBand,
} from '../../utils/grades';
import { useSessionStudent } from '../students/useSessionStudent';
import { useReportCardQuery } from './api/useReportCardQuery';
import { useReportCardsQuery } from './api/useReportCardsQuery';
import type { ReportCardSummary, SubjectResult, Term } from './schemas';

export type ReportCardSubject = {
  key: string;
  /** Posição na ordem da API: entra no testID (0 = Língua Portuguesa). */
  index: number;
  name: string;
  /** Número da API, para a barra e a faixa. */
  grade: number | null;
  /** `"9,5"`, `"8,0"` ou `"–"`. */
  gradeText: string;
  band: GradeBand;
  /** `"0 faltas"`, `"1 falta"` ou `"Faltas não lançadas"`. */
  absencesText: string;
  accessibilityLabel: string;
};

export type ReportCardTermSummary = {
  /** `1º trimestre · 2025`. */
  title: string;
  /** Média simples das notas lançadas, com uma casa. */
  average: number | null;
  /** `"8,2"`. */
  averageText: string;
  band: GradeBand;
  /** `Média geral` ou `Média de 10 disciplinas avaliadas`. */
  averageCaption: string;
  absences: number;
  absencesLabel: string;
  subjects: number;
  subjectsLabel: string;
  /** Notas lançadas abaixo de 7. */
  belowTarget: number;
  belowTargetLabel: string;
  /** Alguma nota do trimestre ainda não foi lançada. */
  partial: boolean;
  /** Ao menos uma nota lançada (senão, "Ainda não avaliado"). */
  evaluated: boolean;
  accessibilityLabel: string;
};

type Status = 'loading' | 'error' | 'ready';

const NO_YEARS: readonly ReportCardSummary[] = [];
const NO_TERMS: readonly Term[] = [];

const isEvaluated = (term: Term) =>
  term.subjects.some(subject => subject.grade !== null);

/**
 * Trimestre inicial (DV5): o maior com ao menos uma nota lançada; se nenhum
 * tiver, o 1º. Dá T1 em 2025 e T3 em 2024.
 */
function initialTerm(terms: readonly Term[]): number | null {
  const evaluated = terms.filter(isEvaluated).map(({ term }) => term);
  if (evaluated.length > 0) return Math.max(...evaluated);
  return terms[0]?.term ?? null;
}

function toSubject(subject: SubjectResult, index: number, term: number) {
  const { name, grade, absences } = subject;
  const band = gradeBand(grade);
  const gradeText =
    grade === null ? strings.boletim.gradeMissing : formatGrade(grade);
  const absencesText = strings.boletim.absencesCount(absences);
  return {
    key: `${term}-${index}`,
    index,
    name,
    grade,
    gradeText,
    band,
    absencesText,
    accessibilityLabel:
      grade === null && absences === null
        ? strings.boletim.subjectNotReleasedAccessibilityLabel(name)
        : strings.boletim.subjectAccessibilityLabel(
            name,
            grade === null ? strings.boletim.band.none : gradeText,
            strings.boletim.band[band],
            absencesText,
          ),
  };
}

function toSummary(term: Term, year: number): ReportCardTermSummary {
  const grades = term.subjects.map(subject => subject.grade);
  const released = grades.filter((grade): grade is number => grade !== null);
  const average = averageGrade(grades);
  const band = gradeBand(average);
  const averageText = formatGrade(average);
  const absences = term.subjects.reduce(
    (total, subject) => total + (subject.absences ?? 0),
    0,
  );
  const subjects = term.subjects.length;
  const belowTarget = released.filter(grade => grade < GRADE_TARGET).length;
  const partial = released.length > 0 && released.length < subjects;
  return {
    title: strings.boletim.summaryTitle(term.term, year),
    average,
    averageText,
    band,
    averageCaption: partial
      ? strings.boletim.averagePartial(released.length)
      : strings.boletim.average,
    absences,
    absencesLabel: strings.boletim.statAbsences(absences),
    subjects,
    subjectsLabel: strings.boletim.statSubjects,
    belowTarget,
    belowTargetLabel: strings.boletim.statBelow,
    partial,
    evaluated: released.length > 0,
    accessibilityLabel: strings.boletim.summaryAccessibilityLabel(
      term.term,
      year,
      averageText,
      strings.boletim.band[band],
      absences,
      subjects,
      belowTarget,
    ),
  };
}

/**
 * Boletim v2 (01-design.md da v2, 3.4, V8/N4): o ano e o trimestre em
 * segmentos, o resumo do trimestre e as disciplinas em cards abertos, sem
 * acordeão. Abre no ano mais recente e no último trimestre avaliado; trocar
 * de ano busca o boletim dele e recalcula o trimestre; trocar de aluno volta
 * ao ano mais recente do novo aluno.
 */
export function useReportCardViewModel() {
  const { student } = useSessionStudent();
  const studentId = student?.id ?? null;
  const yearsQuery = useReportCardsQuery(studentId);
  const years = yearsQuery.data ?? NO_YEARS;

  // Escolha do usuário e estado do Tentar de novo, válidos só para o aluno
  // em que aconteceram.
  const [chosenYear, setChosenYear] = useState<number | null>(null);
  const [failedRetries, setFailedRetries] = useState(0);
  // O refetch de uma query sem dados volta o status para `pending`; durante o
  // Tentar de novo a tela fica no erro, com o spinner no botão (3.8).
  const [retrying, setRetrying] = useState(false);
  const [stateFor, setStateFor] = useState(studentId);
  if (stateFor !== studentId) {
    setStateFor(studentId);
    setChosenYear(null);
    setRetrying(false);
    setFailedRetries(0);
  }

  const latestYear = years.reduce<number | null>(
    (latest, { year }) => (latest === null || year > latest ? year : latest),
    null,
  );
  const selected =
    years.find(item => item.year === chosenYear) ??
    years.find(item => item.year === latestYear) ??
    null;
  const selectedYear = selected?.year ?? null;

  const reportQuery = useReportCardQuery(studentId, selectedYear);

  const status: Status = yearsQuery.data
    ? 'ready'
    : yearsQuery.isError || retrying
    ? 'error'
    : 'loading';
  const termsStatus: Status = reportQuery.data
    ? 'ready'
    : reportQuery.isError || (retrying && status === 'ready')
    ? 'error'
    : 'loading';
  const inError =
    status === 'error' || (status === 'ready' && termsStatus === 'error');
  if (!inError && failedRetries !== 0) setFailedRetries(0);

  // Trimestre escolhido, válido só para o aluno e o ano em que foi escolhido.
  const contentKey = `${studentId}:${selectedYear}`;
  const [termFor, setTermFor] = useState(contentKey);
  const [chosenTerm, setChosenTerm] = useState<number | null>(null);
  if (termFor !== contentKey) {
    setTermFor(contentKey);
    setChosenTerm(null);
  }

  // Direção da troca (o resumo entra do lado do segmento escolhido, 4.5):
  // 1 = da direita, −1 = da esquerda, 0 = sem deslocamento.
  const [slideDirection, setSlideDirection] = useState<-1 | 0 | 1>(0);

  // A 1ª exibição espera a entrada do header (4.3); depois da 1ª troca, nenhuma.
  const [firstContentKey, setFirstContentKey] = useState<string | null>(null);
  const [firstContentLeft, setFirstContentLeft] = useState(false);
  if (termsStatus === 'ready' && firstContentKey === null) {
    setFirstContentKey(contentKey);
  } else if (
    firstContentKey !== null &&
    !firstContentLeft &&
    contentKey !== firstContentKey
  ) {
    setFirstContentLeft(true);
  }
  const isFirstContent =
    !firstContentLeft &&
    (firstContentKey === null || contentKey === firstContentKey);

  const terms = reportQuery.data?.terms ?? NO_TERMS;
  const currentTerm =
    terms.find(({ term }) => term === chosenTerm) ??
    terms.find(({ term }) => term === initialTerm(terms)) ??
    null;
  const selectedTerm = currentTerm?.term ?? null;

  const summary =
    currentTerm && selectedYear !== null
      ? toSummary(currentTerm, selectedYear)
      : null;
  const subjects: ReportCardSubject[] = currentTerm
    ? currentTerm.subjects.map((subject, index) =>
        toSubject(subject, index, currentTerm.term),
      )
    : [];

  // O refetch de uma query sem dados zera o `error` enquanto busca: durante o
  // Tentar de novo a descrição vem do último erro que terminou, senão ela
  // trocaria para o texto de conexão até a resposta chegar.
  const currentError =
    status === 'error' ? yearsQuery.error : reportQuery.error ?? null;
  const [lastError, setLastError] = useState(currentError);
  if (currentError !== null && currentError !== lastError) {
    setLastError(currentError);
  }
  const failedError = currentError ?? (retrying ? lastError : null);
  const errorDescription =
    failedError?.kind === 'notFound'
      ? strings.boletim.error.notFound
      : strings.common.error.description;

  const yearOptions: SegmentOption[] = years.map(item => {
    const label =
      years.length === 1
        ? strings.boletim.yearSingle(item.year, item.className)
        : strings.boletim.yearOption(item.year, item.className);
    return { key: String(item.year), label };
  });

  const termOptions: SegmentOption[] = terms.map(({ term }) => ({
    key: String(term),
    label: strings.boletim.termShort(term),
    accessibilityLabel: strings.boletim.termAccessibilityLabel(term),
  }));

  const onSelectYear = (key: string) => {
    const year = Number(key);
    const nextIndex = years.findIndex(item => item.year === year);
    if (nextIndex < 0 || year === selectedYear) return;
    const currentIndex = years.findIndex(item => item.year === selectedYear);
    setSlideDirection(nextIndex > currentIndex ? 1 : -1);
    setChosenYear(year);
  };

  const onSelectTerm = (key: string) => {
    const term = Number(key);
    if (!terms.some(item => item.term === term) || term === selectedTerm) {
      return;
    }
    setSlideDirection(selectedTerm === null || term > selectedTerm ? 1 : -1);
    setChosenTerm(term);
  };

  const onRetry = async () => {
    if (retrying) return;
    setRetrying(true);
    const result =
      status === 'error'
        ? await yearsQuery.refetch()
        : await reportQuery.refetch();
    setRetrying(false);
    if (result.isError) setFailedRetries(count => count + 1);
  };

  return {
    /** A lista de anos: sem ela, nada do boletim aparece. */
    status,
    /** O boletim do ano escolhido (trimestres). */
    termsStatus,
    isEmpty: status === 'ready' && years.length === 0,
    yearOptions,
    selectedYearKey: selected ? String(selected.year) : null,
    termOptions,
    selectedTermKey: selectedTerm === null ? null : String(selectedTerm),
    selectedTerm,
    summary,
    subjects,
    subjectsHeader: strings.boletim.subjectsHeader(subjects.length),
    notEvaluatedDescription:
      selectedTerm === null
        ? ''
        : strings.boletim.notEvaluatedDescription(selectedTerm),
    /** Muda com o aluno, o ano e o trimestre: a View usa como `key` do conteúdo. */
    contentKey: `${contentKey}:${selectedTerm}`,
    slideDirection,
    contentEnterDelay: isFirstContent ? 4 * motion.stagger : 0,
    errorDescription,
    onSelectYear,
    onSelectTerm,
    onRetry,
    retrying,
    /** Muda a cada Tentar de novo que falha: dispara o shake do ErrorState. */
    shakeKey: failedRetries,
  };
}

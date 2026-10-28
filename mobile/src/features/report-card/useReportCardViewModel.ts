import { useState } from 'react';

import { strings } from '../../constants/strings';
import { motion } from '../../theme';
import { formatAbsences, formatGrade } from '../../utils/grades';
import { useSessionStudent } from '../students/useSessionStudent';
import { useReportCardQuery } from './api/useReportCardQuery';
import { useReportCardsQuery } from './api/useReportCardsQuery';
import type { ReportCardSummary, SubjectResult } from './schemas';

export type ReportCardYearOption = { key: string; label: string };

export type ReportCardSubject = {
  key: string;
  /** Posição na ordem da API: entra no testID (0 = Língua Portuguesa). */
  index: number;
  name: string;
  /** `"9,5"`, `"8,0"` ou `"-"`. */
  grade: string;
  /** `"0"` ou `"-"`. */
  absences: string;
  resultAccessibilityLabel: string;
  expanded: boolean;
};

export type ReportCardTerm = {
  term: number;
  title: string;
  accessibilityLabel: string;
  expanded: boolean;
  subjects: ReportCardSubject[];
};

type Status = 'loading' | 'error' | 'ready';

const NO_YEARS: readonly ReportCardSummary[] = [];
const NONE: readonly string[] = [];

const subjectKey = (term: number, index: number) => `${term}-${index}`;

function resultAccessibilityLabel({ grade, absences }: SubjectResult) {
  if (grade === null && absences === null) {
    return strings.boletim.notReleasedAccessibilityLabel;
  }
  const gradeText =
    grade === null ? strings.boletim.gradeNotReleased : formatGrade(grade);
  return absences === null
    ? `Nota ${gradeText}, ${strings.boletim.absencesNotReleased}`
    : strings.boletim.resultAccessibilityLabel(gradeText, absences);
}

const toggle = (list: readonly string[], key: string) =>
  list.includes(key) ? list.filter(item => item !== key) : [...list, key];

/**
 * Boletim (M5, R8): os anos do aluno em uso, o ano escolhido e os trimestres
 * desse ano em acordeão. Abre no ano mais recente; trocar de ano busca o
 * boletim dele e fecha todos os acordeões; trocar de aluno volta ao ano mais
 * recente do novo aluno.
 */
export function useReportCardViewModel() {
  const { student } = useSessionStudent();
  const studentId = student?.id ?? null;
  const yearsQuery = useReportCardsQuery(studentId);
  const years = yearsQuery.data ?? NO_YEARS;

  // Escolha do usuário e estado do TENTAR DE NOVO, válidos só para o aluno
  // em que aconteceram.
  const [chosenYear, setChosenYear] = useState<number | null>(null);
  const [failedRetries, setFailedRetries] = useState(0);
  // O refetch de uma query sem dados volta o status para `pending`; durante o
  // TENTAR DE NOVO a tela fica no erro, com o spinner no botão (3.8).
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

  // Acordeões abertos, válidos só para o aluno e o ano em que foram abertos.
  const contentKey = `${studentId}:${selectedYear}`;
  const [openFor, setOpenFor] = useState(contentKey);
  const [openTerms, setOpenTerms] = useState<readonly string[]>(NONE);
  const [openSubjects, setOpenSubjects] = useState<readonly string[]>(NONE);
  if (openFor !== contentKey) {
    setOpenFor(contentKey);
    setOpenTerms(NONE);
    setOpenSubjects(NONE);
  }

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

  const terms: ReportCardTerm[] = (reportQuery.data?.terms ?? []).map(
    ({ term, subjects }) => ({
      term,
      title: strings.boletim.term(term),
      accessibilityLabel: strings.boletim.termAccessibilityLabel(term),
      expanded: openTerms.includes(String(term)),
      subjects: subjects.map((subject, index) => ({
        key: subjectKey(term, index),
        index,
        name: subject.name,
        grade: formatGrade(subject.grade),
        absences: formatAbsences(subject.absences),
        resultAccessibilityLabel: resultAccessibilityLabel(subject),
        expanded: openSubjects.includes(subjectKey(term, index)),
      })),
    }),
  );

  const failedError =
    status === 'error' ? yearsQuery.error : reportQuery.error ?? null;
  const errorDescription =
    failedError?.kind === 'notFound'
      ? strings.boletim.error.notFound
      : strings.common.error.description;

  const onSelectYear = (key: string) => {
    const year = Number(key);
    if (years.some(item => item.year === year)) setChosenYear(year);
  };

  const onToggleTerm = (term: number) =>
    setOpenTerms(list => toggle(list, String(term)));

  const onToggleSubject = (term: number, index: number) =>
    setOpenSubjects(list => toggle(list, subjectKey(term, index)));

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
    /** A lista de anos (dropdown): sem ela, nada do boletim aparece. */
    status,
    /** Os trimestres do ano escolhido. */
    termsStatus,
    isEmpty: status === 'ready' && years.length === 0,
    yearOptions: years.map(item => ({
      key: String(item.year),
      label: strings.boletim.yearLabel(item.className, item.year),
    })),
    selectedYearKey: selected ? String(selected.year) : null,
    selectedYearLabel: selected
      ? strings.boletim.yearLabel(selected.className, selected.year)
      : '',
    terms,
    /** Muda com o ano e com o aluno: a View usa como `key` dos cards. */
    contentKey,
    contentEnterDelay: isFirstContent ? 4 * motion.stagger : 0,
    errorDescription,
    onSelectYear,
    onToggleTerm,
    onToggleSubject,
    onRetry,
    retrying,
    /** Muda a cada TENTAR DE NOVO que falha: dispara o shake do ErrorState. */
    shakeKey: failedRetries,
  };
}

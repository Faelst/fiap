import { useState } from 'react';

import { motion } from '../../theme';
import { formatDayLabel } from '../../utils/dates';
import { useSessionStudent } from '../students/useSessionStudent';
import { initialAgendaDate } from './agendaDays';
import { useAgendaQuery } from './api/useAgendaQuery';
import type { Agenda } from './schemas';

export type AgendaDayOption = { key: string; label: string };

export type AgendaLesson = {
  key: string;
  startTime: string;
  endTime: string;
  subject: string;
};

type AgendaViewModelOptions = {
  /** Data de "hoje" (D35). Injetável para os testes; no app, a do aparelho. */
  now?: () => Date;
};

const deviceNow = () => new Date();
const NO_DAYS: Agenda = [];

/**
 * Agenda (M4, D35): os dias da semana do aluno em uso, o dia escolhido e as
 * aulas dele. Abre no dia com o mesmo dia da semana de hoje; trocar de aluno
 * volta a esse dia inicial, já com a agenda do novo aluno.
 */
export function useAgendaViewModel({
  now = deviceNow,
}: AgendaViewModelOptions = {}) {
  const { student } = useSessionStudent();
  const studentId = student?.id ?? null;
  const query = useAgendaQuery(studentId);
  const days = query.data ?? NO_DAYS;

  // Escolha do usuário e estado do TENTAR DE NOVO, válidos só para o aluno
  // em que aconteceram.
  const [chosenDate, setChosenDate] = useState<string | null>(null);
  const [failedRetries, setFailedRetries] = useState(0);
  // O refetch de uma query sem dados volta o status para `pending`; durante o
  // TENTAR DE NOVO a tela fica no erro, com o spinner no botão (3.8).
  const [retrying, setRetrying] = useState(false);
  const [stateFor, setStateFor] = useState(studentId);
  if (stateFor !== studentId) {
    setStateFor(studentId);
    setChosenDate(null);
    setRetrying(false);
    setFailedRetries(0);
  }

  const status: 'loading' | 'error' | 'ready' = query.data
    ? 'ready'
    : query.isError || retrying
    ? 'error'
    : 'loading';
  if (status !== 'error' && failedRetries !== 0) setFailedRetries(0);

  const dates = days.map(day => day.date);
  const selectedDay =
    days.find(day => day.date === chosenDate) ??
    days.find(day => day.date === initialAgendaDate(dates, now()));
  const selectedDate = selectedDay?.date ?? null;

  const lessons: AgendaLesson[] = (selectedDay?.lessons ?? []).map(
    (lesson, index) => ({
      key: `${selectedDay?.date}-${index}`,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      subject: lesson.subject,
    }),
  );

  // A 1ª lista espera a entrada do header (4.3); depois da 1ª troca, nenhuma.
  const contentKey = `${studentId}:${selectedDate}`;
  const [firstContentKey, setFirstContentKey] = useState<string | null>(null);
  const [firstContentLeft, setFirstContentLeft] = useState(false);
  if (status === 'ready' && firstContentKey === null) {
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

  const onSelectDay = (date: string) => {
    if (dates.includes(date)) setChosenDate(date);
  };

  const onRetry = async () => {
    if (retrying) return;
    setRetrying(true);
    const result = await query.refetch();
    setRetrying(false);
    if (result.isError) setFailedRetries(count => count + 1);
  };

  return {
    status,
    dayOptions: dates.map(date => ({ key: date, label: formatDayLabel(date) })),
    selectedDate,
    selectedDayLabel: selectedDate ? formatDayLabel(selectedDate) : '',
    /** Muda com o dia e com o aluno: a View usa como `key` da lista. */
    contentKey,
    contentEnterDelay: isFirstContent ? 4 * motion.stagger : 0,
    lessons,
    isEmpty: lessons.length === 0,
    onSelectDay,
    onRetry,
    retrying,
    /** Muda a cada TENTAR DE NOVO que falha: dispara o shake do ErrorState. */
    shakeKey: failedRetries,
  };
}

import { useMemo, useState } from 'react';

import { strings } from '../../constants/strings';
import { sizes } from '../../theme';
import {
  dayParts,
  monthYearLabel,
  weekdayOf,
  weekdayShort,
} from '../../utils/dates';
import { useSessionStudent } from '../students/useSessionStudent';
import { initialAgendaDate } from './agendaDays';
import { useAgendaQuery } from './api/useAgendaQuery';
import type { Agenda } from './schemas';
import {
  lessonBreaks,
  lessonState,
  timeToMinutes,
  timetableRange,
  type ClockPhase,
  type LessonBreak,
  type LessonState,
  type TimetableRange,
} from './timetable';
import { useMinuteClock } from './useMinuteClock';

export type AgendaDayItem = {
  date: string;
  weekdayShort: string;
  dayNumber: number;
  hasLessons: boolean;
  lessonCount: number;
  isToday: boolean;
  accessibilityLabel: string;
  /** Lido pelo leitor de tela quando o dia muda pelo swipe (6.4). */
  announcement: string;
};

export type AgendaLesson = {
  key: string;
  subject: string;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  /** `07:15 – 08:00 · 45 min`. */
  timeLabel: string;
  accessibilityLabel: string;
  state: LessonState;
};

export type AgendaBanner = {
  /** Marcador à esquerda: ponto pulsando, ponto âmbar, relógio, check ou nada. */
  kind: 'now' | 'break' | 'before' | 'after' | 'summary';
  text: string;
  detail: string;
};

export type AgendaPage = {
  date: string;
  isToday: boolean;
  lessons: AgendaLesson[];
  range: TimetableRange | null;
  breaks: LessonBreak[];
  banner: AgendaBanner | null;
  /** Descrição do estado vazio (fim de semana ou dia útil). */
  emptyDescription: string;
};

type AgendaViewModelOptions = {
  /** Data e hora de "agora" (D35 e linha de agora). Injetável para testes. */
  now?: () => Date;
};

const deviceNow = () => new Date();
const NO_DAYS: Agenda = [];
const NO_LESSONS: AgendaLesson[] = [];

function lessonsOf(day: Agenda[number]): AgendaLesson[] {
  return day.lessons.map((lesson, index) => {
    const startMinutes = timeToMinutes(lesson.startTime);
    const endMinutes = timeToMinutes(lesson.endTime);
    return {
      key: `${day.date}-${index}`,
      subject: lesson.subject,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      startMinutes,
      endMinutes,
      timeLabel: strings.agenda.lessonTime(
        lesson.startTime,
        lesson.endTime,
        endMinutes - startMinutes,
      ),
      accessibilityLabel: strings.agenda.lessonAccessibilityLabel(
        lesson.startTime,
        lesson.endTime,
        lesson.subject,
      ),
      state: 'upcoming',
    };
  });
}

function summaryBanner(lessons: AgendaLesson[]): AgendaBanner | null {
  if (lessons.length === 0) return null;
  return {
    kind: 'summary',
    text: strings.agenda.lessonCount(lessons.length),
    detail: strings.agenda.banner.summaryDetail(
      lessons[0].startTime,
      lessons[lessons.length - 1].endTime,
    ),
  };
}

/** Banner da página de hoje na fase do relógio (2.8). */
function todayBanner(
  lessons: AgendaLesson[],
  phase: ClockPhase,
): AgendaBanner | null {
  const { banner } = strings.agenda;
  switch (phase.kind) {
    case 'lesson': {
      const lesson = lessons[phase.index];
      return {
        kind: 'now',
        text: banner.now(lesson.subject),
        detail: banner.nowDetail(lesson.endTime),
      };
    }
    case 'break':
      return {
        kind: 'break',
        text: banner.break,
        detail: banner.breakDetail(lessons[phase.index].startTime),
      };
    case 'before':
      return {
        kind: 'before',
        text: banner.before(lessons[0].startTime),
        detail: '',
      };
    case 'after':
      return { kind: 'after', text: banner.after, detail: '' };
    default:
      return null;
  }
}

function withStates(lessons: AgendaLesson[], phase: ClockPhase) {
  return lessons.map((lesson, index) => {
    const state = lessonState(index, phase);
    const suffix =
      state === 'now'
        ? strings.agenda.lessonNowSuffix
        : state === 'past'
        ? strings.agenda.lessonPastSuffix
        : '';
    return {
      ...lesson,
      state,
      accessibilityLabel: `${strings.agenda.lessonAccessibilityLabel(
        lesson.startTime,
        lesson.endTime,
        lesson.subject,
      )}${suffix}`,
    };
  });
}

/**
 * Agenda (M4, D35, V4/V5): a faixa com os 7 dias, uma página por dia com a
 * grade das aulas e, no dia de hoje, o relógio da linha de agora. Abre no
 * dia com o mesmo dia da semana de hoje; trocar de aluno volta a esse dia,
 * já com a agenda do novo aluno.
 */
export function useAgendaViewModel({
  now = deviceNow,
}: AgendaViewModelOptions = {}) {
  const { student } = useSessionStudent();
  const studentId = student?.id ?? null;
  const query = useAgendaQuery(studentId);
  const agenda = query.data ?? NO_DAYS;

  // Escolha do usuário e estado do TENTAR DE NOVO, válidos só para o aluno
  // em que aconteceram.
  const [chosenDate, setChosenDate] = useState<string | null>(null);
  const [failedRetries, setFailedRetries] = useState(0);
  // O refetch de uma query sem dados volta o status para `pending`; durante o
  // TENTAR DE NOVO a tela fica no erro, com o spinner no botão (3.8).
  const [retrying, setRetrying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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

  // "Hoje" (D35): o dia da semana fixa com o mesmo dia da semana de hoje.
  const todayDate = initialAgendaDate(
    agenda.map(day => day.date),
    now(),
  );

  const base = useMemo(() => {
    const dates = agenda.map(day => day.date);
    const days: AgendaDayItem[] = agenda.map(day => {
      const { weekday, day: dayNumber, month } = dayParts(day.date);
      const count = day.lessons.length;
      const isToday = day.date === todayDate;
      return {
        date: day.date,
        weekdayShort: weekdayShort(day.date),
        dayNumber,
        hasLessons: count > 0,
        lessonCount: count,
        isToday,
        accessibilityLabel: strings.agenda.dayAccessibilityLabel(
          weekday,
          dayNumber,
          month,
          count,
          isToday,
        ),
        announcement: strings.agenda.dayChangedAnnouncement(
          weekday,
          dayNumber,
          month,
          count,
        ),
      };
    });
    const pages: AgendaPage[] = agenda.map(day => {
      const lessons = lessonsOf(day);
      const weekday = weekdayOf(day.date);
      return {
        date: day.date,
        isToday: day.date === todayDate,
        lessons,
        range: timetableRange(lessons),
        breaks: lessonBreaks(lessons, sizes.timetable.minGap),
        banner: summaryBanner(lessons),
        emptyDescription:
          weekday === 0 || weekday === 6
            ? strings.agenda.emptyWeekend
            : strings.agenda.emptyWeekday,
      };
    });
    return { dates, days, pages, monthLabel: monthYearLabel(dates) };
  }, [agenda, todayDate]);

  const todayIndex = todayDate ? base.dates.indexOf(todayDate) : -1;
  const todayLessons = base.pages[todayIndex]?.lessons ?? NO_LESSONS;

  // Só a página de hoje depende do relógio; as outras mantêm a identidade
  // (o pager memoiza as páginas).
  const clock = useMinuteClock({
    lessons: todayLessons,
    now,
    enabled: status === 'ready' && todayLessons.length > 0,
  });
  const { phase } = clock;
  const pages = useMemo(
    () =>
      base.pages.map((page, index) =>
        index === todayIndex && page.lessons.length > 0
          ? {
              ...page,
              lessons: withStates(page.lessons, phase),
              banner: todayBanner(page.lessons, phase),
            }
          : page,
      ),
    [base.pages, todayIndex, phase],
  );

  const chosenIndex = chosenDate ? base.dates.indexOf(chosenDate) : -1;
  const selectedIndex = chosenIndex >= 0 ? chosenIndex : todayIndex;
  const selectedDate = base.dates[selectedIndex] ?? null;

  const onSelectDay = (date: string) => {
    if (base.dates.includes(date)) setChosenDate(date);
  };

  const onSelectToday = () => {
    if (todayDate) setChosenDate(todayDate);
  };

  const onRetry = async () => {
    if (retrying) return;
    setRetrying(true);
    const result = await query.refetch();
    setRetrying(false);
    if (result.isError) setFailedRetries(count => count + 1);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return {
    status,
    /** Remonta o pager (no dia de hoje) quando o aluno muda. */
    studentKey: studentId ?? '',
    days: base.days,
    pages,
    monthLabel: base.monthLabel,
    selectedIndex,
    selectedDate,
    todayIndex,
    showTodayButton: todayIndex >= 0 && selectedIndex !== todayIndex,
    isWeekEmpty: status === 'ready' && base.days.length === 0,
    /** Relógio da linha de agora (página de hoje). */
    clockMinutes: clock.minutes,
    now,
    onSelectDay,
    onSelectToday,
    refreshing,
    onRefresh,
    onRetry,
    retrying,
    /** Muda a cada TENTAR DE NOVO que falha: dispara o shake do ErrorState. */
    shakeKey: failedRetries,
  };
}

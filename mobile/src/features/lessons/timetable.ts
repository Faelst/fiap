/*
 * Cálculos da grade da Agenda (01-design.md da v2, 2.10): minutos do dia,
 * faixa de horas, intervalos, fase do relógio e a rolagem até agora. Puros,
 * sem tema nem React: a View só converte minutos em pontos.
 */

const MINUTES_PER_HOUR = 60;
const TIME = /^(\d{2}):(\d{2})$/;

/** `"07:15"` → 435 (minutos desde a meia-noite). */
export function timeToMinutes(time: string): number {
  const match = TIME.exec(time);
  if (!match) throw new Error(`Horário inválido: ${time}`);
  return Number(match[1]) * MINUTES_PER_HOUR + Number(match[2]);
}

/** 435 → `"07:15"`. */
export function formatMinutes(minutes: number): string {
  'worklet';
  const whole = Math.max(Math.floor(minutes), 0);
  const hours = Math.floor(whole / MINUTES_PER_HOUR) % 24;
  const rest = whole % MINUTES_PER_HOUR;
  return `${hours < 10 ? '0' : ''}${hours}:${rest < 10 ? '0' : ''}${rest}`;
}

/** Minutos do dia na hora local de `date`. */
export function minutesOfDay(date: Date): number {
  return date.getHours() * MINUTES_PER_HOUR + date.getMinutes();
}

export type MinuteSpan = { startMinutes: number; endMinutes: number };

export type TimetableRange = { start: number; end: number };

/**
 * Faixa da grade: da hora cheia antes da 1ª aula à hora cheia depois da
 * última (07:15–12:15 → 07:00–13:00). Sem aulas, `null`.
 */
export function timetableRange(
  lessons: readonly MinuteSpan[],
): TimetableRange | null {
  if (lessons.length === 0) return null;
  const first = Math.min(...lessons.map(lesson => lesson.startMinutes));
  const last = Math.max(...lessons.map(lesson => lesson.endMinutes));
  const start = Math.floor(first / MINUTES_PER_HOUR) * MINUTES_PER_HOUR;
  const end = Math.max(
    Math.ceil(last / MINUTES_PER_HOUR) * MINUTES_PER_HOUR,
    start + MINUTES_PER_HOUR,
  );
  return { start, end };
}

/** Horas cheias da faixa, inclusive as pontas (07:00, 08:00 … 13:00). */
export function hourMarks(range: TimetableRange): number[] {
  const marks: number[] = [];
  for (let m = range.start; m <= range.end; m += MINUTES_PER_HOUR) {
    marks.push(m);
  }
  return marks;
}

export type LessonBreak = MinuteSpan & { minutes: number };

/** Vãos de pelo menos `minGap` minutos entre aulas seguidas. */
export function lessonBreaks(
  lessons: readonly MinuteSpan[],
  minGap: number,
): LessonBreak[] {
  const breaks: LessonBreak[] = [];
  for (let i = 1; i < lessons.length; i += 1) {
    const startMinutes = lessons[i - 1].endMinutes;
    const endMinutes = lessons[i].startMinutes;
    const minutes = endMinutes - startMinutes;
    if (minutes >= minGap) breaks.push({ startMinutes, endMinutes, minutes });
  }
  return breaks;
}

/**
 * Fase do dia em relação às aulas (2.10): antes da 1ª, numa aula (`index` =
 * a aula), no intervalo (`index` = a próxima aula) ou depois da última.
 */
export type ClockPhase =
  | { kind: 'before'; index: 0 }
  | { kind: 'lesson'; index: number }
  | { kind: 'break'; index: number }
  | { kind: 'after'; index: number }
  | { kind: 'none'; index: -1 };

export function clockPhase(
  lessons: readonly MinuteSpan[],
  minutes: number,
): ClockPhase {
  if (lessons.length === 0) return { kind: 'none', index: -1 };
  if (minutes < lessons[0].startMinutes) return { kind: 'before', index: 0 };
  for (let i = 0; i < lessons.length; i += 1) {
    const lesson = lessons[i];
    if (minutes >= lesson.startMinutes && minutes < lesson.endMinutes) {
      return { kind: 'lesson', index: i };
    }
    const next = lessons[i + 1];
    if (next && minutes >= lesson.endMinutes && minutes < next.startMinutes) {
      return { kind: 'break', index: i + 1 };
    }
  }
  return { kind: 'after', index: lessons.length };
}

export function samePhase(a: ClockPhase, b: ClockPhase): boolean {
  return a.kind === b.kind && a.index === b.index;
}

export type LessonState = 'upcoming' | 'now' | 'past';

/** Estado da aula `index` na fase atual (só na página de hoje). */
export function lessonState(index: number, phase: ClockPhase): LessonState {
  if (phase.kind === 'none' || phase.kind === 'before') return 'upcoming';
  if (phase.kind === 'lesson' && index === phase.index) return 'now';
  return index < phase.index ? 'past' : 'upcoming';
}

/**
 * Altura de uma hora na grade (2.10): compacta em telas baixas e crescendo
 * com a fonte do sistema até o teto, para a duração continuar proporcional.
 */
export function hourHeight(
  windowHeight: number,
  fontScale: number,
  tokens: { hour: number; hourCompact: number; maxFontScale: number },
  compactBelow = 700,
): number {
  const base = windowHeight < compactBelow ? tokens.hourCompact : tokens.hour;
  return base * Math.min(Math.max(fontScale, 1), tokens.maxFontScale);
}

/**
 * Rolagem automática até agora (2.10): só quando a linha (y no conteúdo)
 * está fora da área visível; ela fica a `anchor` da altura visível.
 */
export function autoScrollTarget(
  lineY: number,
  viewportHeight: number,
  anchor: number,
): number | null {
  if (viewportHeight <= 0) return null;
  if (lineY >= 0 && lineY <= viewportHeight) return null;
  return Math.max(lineY - viewportHeight * anchor, 0);
}

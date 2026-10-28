/*
 * Datas da agenda sem `Intl` (que varia no Hermes) e sempre locais:
 * `new Date("2025-03-17")` é meia-noite UTC e, no Brasil, vira o dia 16.
 */

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

const WEEKDAYS = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
] as const;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Lê `AAAA-MM-DD` como meia-noite local. Lança erro se a data não existe. */
export function parseLocalDate(isoDate: string): Date {
  const match = ISO_DATE.exec(isoDate);
  if (!match) {
    throw new Error(`Data inválida: ${isoDate}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    throw new Error(`Data inválida: ${isoDate}`);
  }
  return date;
}

/** Dia da semana da data local (0 = domingo … 6 = sábado). */
export function weekdayOf(isoDate: string): number {
  return parseLocalDate(isoDate).getDay();
}

/** Nome do dia da semana em pt-BR, minúsculo. */
export function weekdayName(weekday: number): string {
  return WEEKDAYS[weekday] ?? '';
}

/** `"2025-03-17"` → `"17 de março, segunda-feira"`. */
export function formatDayLabel(isoDate: string): string {
  const date = parseLocalDate(isoDate);
  return `${date.getDate()} de ${MONTHS[date.getMonth()]}, ${weekdayName(
    date.getDay(),
  )}`;
}

const WEEKDAYS_SHORT = [
  'dom',
  'seg',
  'ter',
  'qua',
  'qui',
  'sex',
  'sáb',
] as const;

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/** `"2025-03-17"` → `"seg"` (a variante `overline` põe em maiúsculas). */
export function weekdayShort(isoDate: string): string {
  return WEEKDAYS_SHORT[weekdayOf(isoDate)] ?? '';
}

/** Nome do mês (0 = janeiro) em pt-BR, minúsculo. */
export function monthName(month: number): string {
  return MONTHS[month] ?? '';
}

/** `"2025-03-17"` → `{ weekday: "Segunda-feira", day: 17, month: "março" }`. */
export function dayParts(isoDate: string) {
  const date = parseLocalDate(isoDate);
  return {
    weekday: capitalize(weekdayName(date.getDay())),
    day: date.getDate(),
    month: monthName(date.getMonth()),
  };
}

/**
 * Cabeçalho da semana: `"Março 2025"`; se cruzar meses, `"Março – Abril
 * 2025"`; se cruzar anos, `"Dezembro 2025 – Janeiro 2026"`.
 */
export function monthYearLabel(isoDates: readonly string[]): string {
  if (isoDates.length === 0) return '';
  const first = parseLocalDate(isoDates[0]);
  const last = parseLocalDate(isoDates[isoDates.length - 1]);
  const label = (date: Date) => capitalize(monthName(date.getMonth()));
  if (first.getFullYear() !== last.getFullYear()) {
    return `${label(first)} ${first.getFullYear()} – ${label(
      last,
    )} ${last.getFullYear()}`;
  }
  if (first.getMonth() !== last.getMonth()) {
    return `${label(first)} – ${label(last)} ${last.getFullYear()}`;
  }
  return `${label(first)} ${first.getFullYear()}`;
}

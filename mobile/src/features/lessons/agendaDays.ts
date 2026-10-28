import { weekdayOf } from '../../utils/dates';

/**
 * Dia em que a Agenda abre (D35): o dia da agenda com o mesmo dia da semana
 * de hoje. Os dados são de uma semana fixa de 2025, então abrir na data real
 * cairia sempre em "sem aulas". Sem correspondência, o primeiro dia.
 */
export function initialAgendaDate(
  dates: readonly string[],
  today: Date,
): string | null {
  const weekday = today.getDay();
  return dates.find(date => weekdayOf(date) === weekday) ?? dates[0] ?? null;
}

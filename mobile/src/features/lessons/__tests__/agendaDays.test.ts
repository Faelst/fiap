import { initialAgendaDate } from '../agendaDays';

const WEEK = [
  '2025-03-16',
  '2025-03-17',
  '2025-03-18',
  '2025-03-19',
  '2025-03-20',
  '2025-03-21',
  '2025-03-22',
];

describe('initialAgendaDate (D35)', () => {
  // 25/10/2026 é domingo; 31/10/2026, sábado.
  it.each([
    ['domingo', new Date(2026, 9, 25), '2025-03-16'],
    ['segunda', new Date(2026, 9, 26), '2025-03-17'],
    ['terça', new Date(2026, 9, 27), '2025-03-18'],
    ['quarta', new Date(2026, 9, 28), '2025-03-19'],
    ['quinta', new Date(2026, 9, 29), '2025-03-20'],
    ['sexta', new Date(2026, 9, 30), '2025-03-21'],
    ['sábado', new Date(2026, 9, 31, 23, 59), '2025-03-22'],
  ])(
    'hoje %s abre no dia da agenda com o mesmo dia da semana',
    (_, today, expected) => {
      expect(initialAgendaDate(WEEK, today)).toBe(expected);
    },
  );

  it('sem dia com o mesmo dia da semana, usa o primeiro da agenda', () => {
    const sunday = new Date(2026, 9, 25);
    expect(initialAgendaDate(['2025-03-17', '2025-03-18'], sunday)).toBe(
      '2025-03-17',
    );
  });

  it('agenda vazia não tem dia inicial', () => {
    expect(initialAgendaDate([], new Date(2026, 9, 27))).toBeNull();
  });
});

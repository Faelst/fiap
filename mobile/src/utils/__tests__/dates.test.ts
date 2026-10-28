import {
  formatDayLabel,
  parseLocalDate,
  weekdayName,
  weekdayOf,
} from '../dates';

describe('parseLocalDate', () => {
  it('lê "AAAA-MM-DD" como data local (meia-noite local, não UTC)', () => {
    const date = parseLocalDate('2025-03-17');
    expect(date.getFullYear()).toBe(2025);
    expect(date.getMonth()).toBe(2);
    expect(date.getDate()).toBe(17);
    expect(date.getHours()).toBe(0);
  });

  it('recusa formato inválido', () => {
    expect(() => parseLocalDate('17/03/2025')).toThrow();
    expect(() => parseLocalDate('2025-13-01')).toThrow();
    expect(() => parseLocalDate('2025-02-30')).toThrow();
  });
});

describe('weekdayOf', () => {
  it('devolve o dia da semana (0 = domingo) da data local', () => {
    expect(weekdayOf('2025-03-16')).toBe(0);
    expect(weekdayOf('2025-03-17')).toBe(1);
    expect(weekdayOf('2025-03-22')).toBe(6);
  });
});

describe('weekdayName', () => {
  it('nomeia os dias em pt-BR minúsculo', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(weekdayName)).toEqual([
      'domingo',
      'segunda-feira',
      'terça-feira',
      'quarta-feira',
      'quinta-feira',
      'sexta-feira',
      'sábado',
    ]);
  });
});

describe('formatDayLabel', () => {
  it('formata como "{dia} de {mês}, {dia da semana}"', () => {
    expect(formatDayLabel('2025-03-17')).toBe('17 de março, segunda-feira');
    expect(formatDayLabel('2025-03-16')).toBe('16 de março, domingo');
    expect(formatDayLabel('2025-03-22')).toBe('22 de março, sábado');
  });

  it('não põe zero à esquerda e cobre todos os meses', () => {
    expect(formatDayLabel('2025-01-01')).toBe('1 de janeiro, quarta-feira');
    expect(formatDayLabel('2025-12-31')).toBe('31 de dezembro, quarta-feira');
  });
});

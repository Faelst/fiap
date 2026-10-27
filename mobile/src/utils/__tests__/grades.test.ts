import { formatAbsences, formatGrade } from '../grades';

describe('formatGrade', () => {
  it('usa vírgula e uma casa decimal', () => {
    expect(formatGrade(9.5)).toBe('9,5');
    expect(formatGrade(8)).toBe('8,0');
    expect(formatGrade(10)).toBe('10,0');
    expect(formatGrade(0)).toBe('0,0');
  });

  it('mostra "-" quando a nota não foi lançada', () => {
    expect(formatGrade(null)).toBe('-');
  });
});

describe('formatAbsences', () => {
  it('mostra o número de faltas, inclusive zero', () => {
    expect(formatAbsences(0)).toBe('0');
    expect(formatAbsences(3)).toBe('3');
  });

  it('mostra "-" quando as faltas não foram lançadas', () => {
    expect(formatAbsences(null)).toBe('-');
  });
});

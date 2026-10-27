import { BadRequestException } from '@nestjs/common';
import { INVALID_YEAR_MESSAGE, ParseYearPipe } from './parse-year.pipe';

describe('ParseYearPipe', () => {
  const pipe = new ParseYearPipe();

  it.each([
    ['2025', 2025],
    ['2024', 2024],
    ['0000', 0],
  ])('converte "%s" em %d', (value, expected) => {
    expect(pipe.transform(value)).toBe(expected);
  });

  it.each([
    '0x7E9',
    '0b11111101001',
    '2025.0',
    ' 2025',
    '2025 ',
    '20e3',
    '+2025',
    '-2025',
    '02025',
    '999',
    '',
    'abc',
    '２０２５',
  ])('recusa "%s" com 400', (value) => {
    expect(() => pipe.transform(value)).toThrow(
      new BadRequestException(INVALID_YEAR_MESSAGE),
    );
  });

  it.each([2025, undefined, null, ['2025']])(
    'recusa valor que não é texto (%p), sinal de que algo já converteu o parâmetro',
    (value) => {
      expect(() => pipe.transform(value)).toThrow(BadRequestException);
    },
  );
});

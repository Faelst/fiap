import 'reflect-metadata';
import { plainToInstance, Transform } from 'class-transformer';
import { validateSync } from 'class-validator';
import { IsCpf, isCpf, normalizeCpf } from './is-cpf';

// CPFs do seed (dígitos verificadores válidos).
const GUSTAVO = '96929456004';
const ADELAIDE = '50879567007';

describe('isCpf', () => {
  it.each([GUSTAVO, ADELAIDE, '31415926590'])(
    'aceita o CPF %s só com dígitos',
    (cpf) => {
      expect(isCpf(cpf)).toBe(true);
    },
  );

  it.each(['969.294.560-04', '508.795.670-07'])(
    'aceita o CPF %s com máscara',
    (cpf) => {
      expect(isCpf(cpf)).toBe(true);
    },
  );

  it.each(['96929456005', '96929456014', '969.294.560-05'])(
    'recusa o CPF %s com dígito verificador errado',
    (cpf) => {
      expect(isCpf(cpf)).toBe(false);
    },
  );

  it.each(['00000000000', '11111111111', '999.999.999-99'])(
    'recusa a sequência repetida %s',
    (cpf) => {
      expect(isCpf(cpf)).toBe(false);
    },
  );

  it.each(['9692945600', '969294560044', '', '969.294.560-0'])(
    'recusa o tamanho errado "%s"',
    (cpf) => {
      expect(isCpf(cpf)).toBe(false);
    },
  );

  it.each([
    'abc96929456004',
    '969 294 560 04',
    '969.294.560.04',
    '969-294-560-04',
    '969.294.56004x',
  ])('recusa o formato "%s"', (cpf) => {
    expect(isCpf(cpf)).toBe(false);
  });

  it.each([96929456004, null, undefined, {}, ['96929456004']])(
    'recusa valor que não é texto (%p)',
    (value) => {
      expect(isCpf(value)).toBe(false);
    },
  );
});

describe('normalizeCpf', () => {
  it('tira a máscara de um CPF no formato aceito', () => {
    expect(normalizeCpf('969.294.560-04')).toBe(GUSTAVO);
  });

  it('mantém o CPF que já está só com dígitos', () => {
    expect(normalizeCpf(GUSTAVO)).toBe(GUSTAVO);
  });

  it('não mexe em valor fora do formato, para o validador recusar', () => {
    expect(normalizeCpf('abc96929456004')).toBe('abc96929456004');
    expect(normalizeCpf(96929456004)).toBe(96929456004);
  });
});

describe('@IsCpf()', () => {
  class Payload {
    @Transform(({ value }) => normalizeCpf(value))
    @IsCpf()
    cpf!: unknown;
  }

  function validate(cpf: unknown) {
    const payload = plainToInstance(Payload, { cpf });
    return { payload, errors: validateSync(payload) };
  }

  it('passa com CPF válido mascarado e deixa só os dígitos', () => {
    const { payload, errors } = validate('969.294.560-04');

    expect(errors).toHaveLength(0);
    expect(payload.cpf).toBe(GUSTAVO);
  });

  it('falha com a mensagem "CPF inválido."', () => {
    const { errors } = validate('96929456005');

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toEqual({ isCpf: 'CPF inválido.' });
  });

  it('falha quando o CPF não vem', () => {
    const { errors } = validate(undefined);

    expect(errors[0].constraints).toEqual({ isCpf: 'CPF inválido.' });
  });
});

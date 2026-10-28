import { formatCpf, isValidCpf, onlyDigits } from '../cpf';

describe('onlyDigits', () => {
  it('remove tudo o que não é dígito', () => {
    expect(onlyDigits('969.294.560-04')).toBe('96929456004');
    expect(onlyDigits('a1b2 c3')).toBe('123');
    expect(onlyDigits('')).toBe('');
  });
});

describe('formatCpf', () => {
  it.each([
    ['', ''],
    ['9', '9'],
    ['969', '969'],
    ['9692', '969.2'],
    ['969294', '969.294'],
    ['9692945', '969.294.5'],
    ['969294560', '969.294.560'],
    ['9692945600', '969.294.560-0'],
    ['96929456004', '969.294.560-04'],
  ])('mascara progressivamente %p como %p', (input, expected) => {
    expect(formatCpf(input)).toBe(expected);
  });

  it('ignora o que não é dígito e corta em 11 dígitos', () => {
    expect(formatCpf('969.294.560-04999')).toBe('969.294.560-04');
    expect(formatCpf('96a9.2')).toBe('969.2');
  });
});

describe('isValidCpf', () => {
  it('aceita CPF com dígitos verificadores corretos, com ou sem máscara', () => {
    expect(isValidCpf('96929456004')).toBe(true);
    expect(isValidCpf('969.294.560-04')).toBe(true);
    expect(isValidCpf('314.159.265-90')).toBe(true);
  });

  it('recusa dígito verificador errado', () => {
    expect(isValidCpf('96929456005')).toBe(false);
    expect(isValidCpf('96929456014')).toBe(false);
  });

  it('recusa tamanho diferente de 11', () => {
    expect(isValidCpf('9692945600')).toBe(false);
    expect(isValidCpf('969294560041')).toBe(false);
    expect(isValidCpf('')).toBe(false);
  });

  it('recusa sequências de um dígito só', () => {
    expect(isValidCpf('00000000000')).toBe(false);
    expect(isValidCpf('111.111.111-11')).toBe(false);
  });
});

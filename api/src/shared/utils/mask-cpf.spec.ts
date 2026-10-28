import { maskCpf } from './mask-cpf';

describe('maskCpf', () => {
  it('mostra só os 6 dígitos do meio', () => {
    expect(maskCpf('96929456004')).toBe('***.294.560-**');
  });

  it('não deixa aparecer os 3 primeiros nem os 2 últimos dígitos', () => {
    const masked = maskCpf('50879567007');

    expect(masked).toBe('***.795.670-**');
    expect(masked).not.toContain('508');
    expect(masked).not.toMatch(/07$/);
  });

  it.each(['', '123', '969.294.560-04', '9692945600a', '969294560041'])(
    'devolve a máscara toda quando o valor não tem 11 dígitos ("%s")',
    (value) => {
      expect(maskCpf(value)).toBe('***.***.***-**');
    },
  );
});

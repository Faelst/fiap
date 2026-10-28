import { REDACTED, redact } from '../redact';

describe('redact', () => {
  it('troca o valor das chaves sensíveis, sem olhar maiúsculas', () => {
    expect(
      redact({
        Authorization: 'Bearer abc',
        password: '123456',
        cpf: '96929456004',
        accessToken: 'jwt',
        url: '/me',
      }),
    ).toEqual({
      Authorization: REDACTED,
      password: REDACTED,
      cpf: REDACTED,
      accessToken: REDACTED,
      url: '/me',
    });
  });

  it('troca também token genérico e refresh token', () => {
    expect(
      redact({
        token: 'a',
        refreshToken: 'b',
        tokenType: 'x',
      }),
    ).toEqual({
      token: REDACTED,
      refreshToken: REDACTED,
      tokenType: 'x',
    });
  });

  it('procura em objetos aninhados e em arrays', () => {
    expect(
      redact({
        headers: { authorization: 'Bearer abc' },
        list: [{ CPF: '1' }, 'texto', 3],
      }),
    ).toEqual({
      headers: { authorization: REDACTED },
      list: [{ CPF: REDACTED }, 'texto', 3],
    });
  });

  it('não altera o objeto original', () => {
    const original = { password: 'x', nested: { cpf: 'y' } };
    redact(original);
    expect(original).toEqual({ password: 'x', nested: { cpf: 'y' } });
  });

  it('reduz Error a nome e mensagem (sem config nem corpo de request)', () => {
    const error = Object.assign(new Error('falhou'), {
      config: { data: '{"password":"123456"}' },
    });
    expect(redact({ error })).toEqual({
      error: { name: 'Error', message: 'falhou' },
    });
  });

  it('aguenta referência circular', () => {
    const a: Record<string, unknown> = { name: 'a' };
    a.self = a;
    expect(redact(a)).toEqual({ name: 'a', self: '[Circular]' });
  });

  it('devolve primitivos como estão', () => {
    expect(redact('texto')).toBe('texto');
    expect(redact(42)).toBe(42);
    expect(redact(null)).toBeNull();
    expect(redact(undefined)).toBeUndefined();
  });
});

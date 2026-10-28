import { AxiosError, AxiosHeaders, CanceledError } from 'axios';
import { z } from 'zod';

import { ApiError, toApiError } from '../errors';

function axiosErrorWith(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, {
    status,
    statusText: '',
    data,
    headers: {},
    config,
  });
}

describe('toApiError', () => {
  it.each([
    [400, 'badRequest'],
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'notFound'],
    [429, 'rateLimited'],
    [500, 'server'],
    [503, 'server'],
    [418, 'unknown'],
  ] as const)('status %p vira kind %p', (status, kind) => {
    const error = toApiError(axiosErrorWith(status, {}));
    expect(error).toBeInstanceOf(ApiError);
    expect(error.kind).toBe(kind);
    expect(error.status).toBe(status);
  });

  it('guarda a mensagem da API (string ou lista do ValidationPipe)', () => {
    expect(
      toApiError(axiosErrorWith(401, { message: 'Usuário ou senha inválida.' }))
        .apiMessage,
    ).toBe('Usuário ou senha inválida.');
    expect(
      toApiError(axiosErrorWith(400, { message: ['cpf inválido', 'x'] }))
        .apiMessage,
    ).toBe('cpf inválido');
    expect(
      toApiError(
        axiosErrorWith(403, {
          statusCode: 403,
          message: 'Você não tem acesso a este aluno.',
          error: 'Forbidden',
        }),
      ).apiMessage,
    ).toBe('Você não tem acesso a este aluno.');
  });

  it('corpo fora do formato do Nest não quebra: fica sem mensagem', () => {
    expect(
      toApiError(axiosErrorWith(500, '<html>')).apiMessage,
    ).toBeUndefined();
    expect(
      toApiError(axiosErrorWith(400, { message: [] })).apiMessage,
    ).toBeUndefined();
  });

  it('sem resposta (offline, timeout) vira network', () => {
    const error = toApiError(
      new AxiosError('Network Error', AxiosError.ERR_NETWORK),
    );
    expect(error.kind).toBe('network');
    expect(error.status).toBeUndefined();
  });

  it('request cancelado (signal abortado) vira canceled', () => {
    expect(toApiError(new CanceledError()).kind).toBe('canceled');
  });

  it('guarda a causa original para depuração', () => {
    const networkError = new AxiosError(
      'Network Error',
      AxiosError.ERR_NETWORK,
    );
    expect(toApiError(networkError).cause).toMatchObject({
      name: 'AxiosError',
      code: 'ERR_NETWORK',
    });
    const cause = new Error('keychain');
    expect(new ApiError('storage', { cause }).cause).toBe(cause);
  });

  it('a causa de erro HTTP é saneada: sem corpo, headers nem query string', () => {
    const config = {
      method: 'post',
      url: '/auth/login?debug=96929456004',
      data: JSON.stringify({ cpf: '96929456004', password: 'senha-secreta' }),
      headers: new AxiosHeaders({ Authorization: 'Bearer jwt-secreto' }),
    };
    const axiosError = new AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      config,
      null,
      {
        status: 401,
        statusText: '',
        data: { message: 'Usuário ou senha inválida.', cpf: '96929456004' },
        headers: {},
        config,
      },
    );

    const error = toApiError(axiosError);
    const ownProps = Object.fromEntries(
      Object.getOwnPropertyNames(error).map(key => [
        key,
        (error as unknown as Record<string, unknown>)[key],
      ]),
    );
    const dump = JSON.stringify({ error, ownProps, cause: error.cause });

    expect(error.cause).toEqual({
      name: 'AxiosError',
      code: 'ERR_BAD_REQUEST',
      status: 401,
      method: 'POST',
      url: '/auth/login',
    });
    for (const secret of ['96929456004', 'senha-secreta', 'jwt-secreto']) {
      expect(dump).not.toContain(secret);
    }
  });

  it('aceita uma mensagem própria (erro do app, não da API)', () => {
    const error = new ApiError('storage', { message: 'Falhou ao salvar.' });
    expect(error.message).toBe('Falhou ao salvar.');
    expect(error.apiMessage).toBeUndefined();
  });

  it('erro de schema vira invalidResponse', () => {
    const result = z.object({ a: z.string() }).safeParse({ a: 1 });
    expect(result.success).toBe(false);
    expect(toApiError(result.error).kind).toBe('invalidResponse');
  });

  it('ApiError passa como está; qualquer outra coisa vira unknown', () => {
    const original = new ApiError('forbidden', { status: 403 });
    expect(toApiError(original)).toBe(original);
    expect(toApiError(new Error('x')).kind).toBe('unknown');
    expect(toApiError('x').kind).toBe('unknown');
  });
});

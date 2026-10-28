import { z } from 'zod';

import { logger } from '../../logger';
import { ApiError } from '../errors';
import { parseResponse } from '../parseResponse';

const schema = z.object({ name: z.string(), cpf: z.string() });

describe('parseResponse', () => {
  afterEach(() => jest.restoreAllMocks());

  it('devolve o dado validado', () => {
    expect(parseResponse(schema, { name: 'a', cpf: 'x' }, 'GET /me')).toEqual({
      name: 'a',
      cpf: 'x',
    });
  });

  it('resposta fora do contrato vira ApiError invalidResponse e loga o caminho do campo, sem o valor', () => {
    const error = jest.spyOn(logger, 'error').mockImplementation(() => {});

    let thrown: unknown;
    try {
      parseResponse(schema, { name: 1, cpf: '96929456004' }, 'GET /me');
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeInstanceOf(ApiError);
    expect((thrown as ApiError).kind).toBe('invalidResponse');
    expect(error).toHaveBeenCalledWith('resposta fora do contrato', {
      endpoint: 'GET /me',
      issues: [{ path: 'name', code: 'invalid_type' }],
    });
    expect(JSON.stringify(error.mock.calls)).not.toContain('96929456004');
  });
});

import { ArgumentsHost } from '@nestjs/common';
import { DomainError, DomainErrorKind } from './domain-error';
import { DomainErrorFilter } from './domain-error.filter';

class SampleError extends DomainError {
  constructor(
    readonly kind: DomainErrorKind,
    message: string,
  ) {
    super(message);
  }
}

function fakeHost() {
  const json = jest.fn();
  const status = jest.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('DomainErrorFilter', () => {
  const filter = new DomainErrorFilter();

  it.each([
    ['unauthenticated', 401, 'Unauthorized'],
    ['forbidden', 403, 'Forbidden'],
    ['not-found', 404, 'Not Found'],
  ] as const)(
    'erro "%s" vira %d com o corpo padrão do Nest',
    (kind, statusCode, error) => {
      const { host, status, json } = fakeHost();

      filter.catch(new SampleError(kind, 'Mensagem do domínio.'), host);

      expect(status).toHaveBeenCalledWith(statusCode);
      expect(json).toHaveBeenCalledWith({
        statusCode,
        message: 'Mensagem do domínio.',
        error,
      });
    },
  );
});

describe('DomainError', () => {
  it('é um Error com o nome da classe filha', () => {
    const error = new SampleError('not-found', 'x');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('SampleError');
  });
});

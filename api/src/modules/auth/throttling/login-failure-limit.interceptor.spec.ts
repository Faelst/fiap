import { CallHandler, ExecutionContext } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { lastValueFrom, of, throwError } from 'rxjs';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import { LoginFailureLimitInterceptor } from './login-failure-limit.interceptor';
import { LoginFailureLimiter } from './login-failure-limiter';
import { LOGIN_THROTTLE_MESSAGE } from './login-throttle';

const KEY = 'cpf:96929456004';

function contextFor(body: unknown) {
  const setHeader = jest.fn();
  const context = {
    switchToHttp: () => ({
      getRequest: () => ({ body }),
      getResponse: () => ({ setHeader }),
    }),
  } as unknown as ExecutionContext;
  return { context, setHeader };
}

const handler = (result: () => ReturnType<CallHandler['handle']>) => {
  const handle = jest.fn(result);
  return { handle, next: { handle } as CallHandler };
};

describe('LoginFailureLimitInterceptor', () => {
  let limiter: LoginFailureLimiter;
  let interceptor: LoginFailureLimitInterceptor;

  beforeEach(() => {
    limiter = new LoginFailureLimiter({ limit: 2, ttlMs: 60_000 });
    interceptor = new LoginFailureLimitInterceptor(limiter);
  });

  it('conta a falha de credencial pelo CPF normalizado', async () => {
    const { context } = contextFor({ cpf: '969.294.560-04' });

    await expect(
      lastValueFrom(
        interceptor.intercept(
          context,
          handler(() => throwError(() => new InvalidCredentialsError())).next,
        ),
      ),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    limiter.registerFailure(KEY);

    expect(limiter.blockedForMs(KEY)).toBeGreaterThan(0);
  });

  it('não conta outros erros', async () => {
    const { context } = contextFor({ cpf: '96929456004' });
    for (let i = 0; i < 3; i++) {
      await lastValueFrom(
        interceptor.intercept(
          context,
          handler(() => throwError(() => new Error('banco fora'))).next,
        ),
      ).catch(() => undefined);
    }

    expect(limiter.blockedForMs(KEY)).toBe(0);
  });

  it('o sucesso zera as falhas', async () => {
    limiter.registerFailure(KEY);
    const { context } = contextFor({ cpf: '96929456004' });

    await lastValueFrom(
      interceptor.intercept(context, handler(() => of('ok')).next),
    );
    limiter.registerFailure(KEY);

    expect(limiter.blockedForMs(KEY)).toBe(0);
  });

  it('bloqueado: 429 com a mensagem do throttler e Retry-After, sem chamar o login', () => {
    limiter.registerFailure(KEY);
    limiter.registerFailure(KEY);
    const { context, setHeader } = contextFor({ cpf: '96929456004' });
    const { handle, next } = handler(() => of('ok'));

    expect(() => interceptor.intercept(context, next)).toThrow(
      new ThrottlerException(LOGIN_THROTTLE_MESSAGE),
    );
    expect(setHeader).toHaveBeenCalledWith('Retry-After', 60);
    expect(handle).not.toHaveBeenCalled();
  });

  it('sem CPF válido no corpo, só repassa (vale o limite por IP)', async () => {
    const { context } = contextFor({ cpf: '123' });
    const { next } = handler(() =>
      throwError(() => new InvalidCredentialsError()),
    );

    await lastValueFrom(interceptor.intercept(context, next)).catch(
      () => undefined,
    );
    expect(limiter.size).toBe(0);
  });
});

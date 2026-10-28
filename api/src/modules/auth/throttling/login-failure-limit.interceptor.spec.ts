import { CallHandler, ExecutionContext } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { lastValueFrom, Observable, Subject } from 'rxjs';
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

/** Handler que só termina quando o teste manda (simula o bcrypt em curso). */
function pendingHandler() {
  const subject = new Subject<unknown>();
  const handle = jest.fn((): Observable<unknown> => subject);
  return { subject, handle, next: { handle } as CallHandler };
}

describe('LoginFailureLimitInterceptor', () => {
  let limiter: LoginFailureLimiter;
  let interceptor: LoginFailureLimitInterceptor;
  const gustavo = () => contextFor({ cpf: '969.294.560-04' }).context;

  beforeEach(() => {
    limiter = new LoginFailureLimiter({ limit: 3, ttlMs: 60_000 });
    interceptor = new LoginFailureLimitInterceptor(limiter);
  });

  /** Começa um login e devolve o handler (pendente) e a promessa do resultado. */
  const start = () => {
    const handler = pendingHandler();
    const result = lastValueFrom(
      interceptor.intercept(gustavo(), handler.next),
    ).catch((error: unknown) => error);
    return { ...handler, result };
  };

  it('lote simultâneo: a 4ª é recusada antes de qualquer senha ser conferida', () => {
    const inFlight = [start(), start(), start()];

    const { context, setHeader } = contextFor({ cpf: '96929456004' });
    const fourth = pendingHandler();
    expect(() => interceptor.intercept(context, fourth.next)).toThrow(
      new ThrottlerException(LOGIN_THROTTLE_MESSAGE),
    );
    expect(setHeader).toHaveBeenCalledWith('Retry-After', 60);
    expect(fourth.handle).not.toHaveBeenCalled();
    expect(
      inFlight.every((login) => login.handle.mock.calls.length === 1),
    ).toBe(true);
  });

  it('a senha certa depois das vagas ocupadas recebe 429, mesmo com as outras em curso', () => {
    start();
    start();
    start();
    const right = pendingHandler();

    expect(() => interceptor.intercept(gustavo(), right.next)).toThrow(
      ThrottlerException,
    );
    expect(right.handle).not.toHaveBeenCalled();
  });

  it('falha de credencial mantém a vaga contada', async () => {
    const login = start();
    login.subject.error(new InvalidCredentialsError());

    expect(await login.result).toBeInstanceOf(InvalidCredentialsError);
    start();
    start();
    expect(() =>
      interceptor.intercept(gustavo(), pendingHandler().next),
    ).toThrow(ThrottlerException);
  });

  it('outro erro (ex.: banco fora) devolve a vaga', async () => {
    const logins = [start(), start(), start()];
    for (const login of logins) login.subject.error(new Error('banco fora'));
    await Promise.all(logins.map((login) => login.result));

    expect(limiter.tryAcquire(KEY)).toBe(0);
  });

  it('o sucesso zera o contador', async () => {
    const wrong = start();
    wrong.subject.error(new InvalidCredentialsError());
    await wrong.result;
    const right = start();
    right.subject.next('ok');
    right.subject.complete();
    await right.result;

    expect([start(), start(), start()]).toHaveLength(3);
    expect(() =>
      interceptor.intercept(gustavo(), pendingHandler().next),
    ).toThrow(ThrottlerException);
  });

  it('sem CPF válido no corpo, só repassa e não reserva nada', () => {
    const handler = pendingHandler();
    interceptor.intercept(contextFor({ cpf: '123' }).context, handler.next);

    expect(handler.handle).toHaveBeenCalled();
    expect(limiter.size).toBe(0);
  });
});

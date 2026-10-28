import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import { LoginFailureLimiter } from './login-failure-limiter';
import { cpfThrottleTracker, LOGIN_THROTTLE_MESSAGE } from './login-throttle';

export const LOGIN_FAILURE_LIMITER = Symbol('LOGIN_FAILURE_LIMITER');

/**
 * Limite de falhas de login por CPF, em volta do handler. Antes: reserva a
 * vaga no mesmo tick (`tryAcquire`), ou responde 429 sem conferir a senha.
 * Depois: sucesso zera o contador, falha de credencial mantém a vaga contada e
 * qualquer outro erro devolve a vaga. O use case não sabe de nada disso.
 * Roda depois do ThrottlerGuard (limite por IP) e antes do ValidationPipe,
 * por isso normaliza o CPF do corpo cru (cpfThrottleTracker).
 */
@Injectable()
export class LoginFailureLimitInterceptor implements NestInterceptor {
  constructor(
    @Inject(LOGIN_FAILURE_LIMITER)
    private readonly limiter: LoginFailureLimiter,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const key = cpfThrottleTracker(http.getRequest<Request>().body);
    if (key === null) {
      return next.handle();
    }

    const blockedMs = this.limiter.tryAcquire(key);
    if (blockedMs > 0) {
      http
        .getResponse<Response>()
        .setHeader('Retry-After', Math.ceil(blockedMs / 1000));
      throw new ThrottlerException(LOGIN_THROTTLE_MESSAGE);
    }

    return next.handle().pipe(
      tap(() => this.limiter.reset(key)),
      catchError((error: unknown) => {
        // Falha de credencial: a vaga reservada já é a falha contada.
        if (!(error instanceof InvalidCredentialsError)) {
          this.limiter.release(key);
        }
        return throwError(() => error);
      }),
    );
  }
}

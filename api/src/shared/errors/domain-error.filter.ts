import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainError, DomainErrorKind } from './domain-error';

const TO_HTTP: Record<DomainErrorKind, (message: string) => HttpException> = {
  unauthenticated: (message) => new UnauthorizedException(message),
  forbidden: (message) => new ForbiddenException(message),
  'not-found': (message) => new NotFoundException(message),
};

/**
 * Traduz o erro de domínio para o mesmo corpo de uma HttpException do Nest:
 * `{statusCode, message, error}`. Registrado como APP_FILTER no AppModule.
 */
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter<DomainError> {
  catch(error: DomainError, host: ArgumentsHost): void {
    const http = TO_HTTP[error.kind](error.message);
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(http.getStatus())
      .json(http.getResponse());
  }
}

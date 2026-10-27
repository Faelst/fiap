import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import type { Request } from 'express';

/** Responsável dono do token. Os demais dados vêm do banco, no use case. */
export interface AuthenticatedGuardian {
  id: string;
}

/** Responsável autenticado pelo JwtAuthGuard (`request.user`). */
export const CurrentGuardian = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedGuardian => {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedGuardian }>();
    if (!request.user) {
      // Só acontece numa rota @Public() que usa o decorator por engano.
      throw new UnauthorizedException();
    }
    return request.user;
  },
);

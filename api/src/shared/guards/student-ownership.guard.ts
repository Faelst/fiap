import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedGuardian } from '../decorators/current-guardian';
import { SESSION_INVALID_MESSAGE } from '../errors/session-invalid';

export const STUDENT_ACCESS_CHECKER = Symbol('STUDENT_ACCESS_CHECKER');

export const STUDENT_ACCESS_DENIED_MESSAGE =
  'Você não tem acesso a este aluno.';

/**
 * - `granted`: o responsável é vinculado ao aluno.
 * - `denied`: o responsável existe, mas o aluno não é dele ou não existe.
 * - `unknown-guardian`: o responsável do token não existe mais.
 */
export type StudentAccess = 'granted' | 'denied' | 'unknown-guardian';

export interface StudentAccessChecker {
  checkAccess(guardianId: string, studentId: string): Promise<StudentAccess>;
}

/**
 * Garante que o aluno do `:id` da rota é vinculado ao responsável do token.
 * Aluno inexistente e aluno de outro responsável dão o mesmo 403, para a API
 * não revelar quais ids existem. Roda depois do JwtAuthGuard global.
 */
@Injectable()
export class StudentOwnershipGuard implements CanActivate {
  constructor(
    @Inject(STUDENT_ACCESS_CHECKER)
    private readonly checker: StudentAccessChecker,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<
      Request & {
        user?: AuthenticatedGuardian;
      }
    >();
    const guardianId = request.user?.id;
    if (!guardianId) {
      throw new UnauthorizedException(SESSION_INVALID_MESSAGE);
    }

    const studentId = request.params?.id;
    if (typeof studentId !== 'string' || studentId === '') {
      throw new ForbiddenException(STUDENT_ACCESS_DENIED_MESSAGE);
    }

    const access = await this.checker.checkAccess(guardianId, studentId);
    if (access === 'unknown-guardian') {
      throw new UnauthorizedException(SESSION_INVALID_MESSAGE);
    }
    if (access !== 'granted') {
      throw new ForbiddenException(STUDENT_ACCESS_DENIED_MESSAGE);
    }
    return true;
  }
}

/** `@StudentOwnership()` (D21): aplica o StudentOwnershipGuard. */
export const StudentOwnership = () => UseGuards(StudentOwnershipGuard);

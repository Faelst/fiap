import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import {
  STUDENT_ACCESS_DENIED_MESSAGE,
  StudentAccess,
  StudentAccessChecker,
  StudentOwnershipGuard,
} from './student-ownership.guard';

/** Gustavo é responsável pelo Rafael; Adelaide existe, mas não é. */
class FakeStudentAccessChecker implements StudentAccessChecker {
  readonly calls: Array<[string, string]> = [];

  checkAccess(guardianId: string, studentId: string): Promise<StudentAccess> {
    this.calls.push([guardianId, studentId]);
    if (guardianId !== 'gustavo' && guardianId !== 'adelaide') {
      return Promise.resolve('unknown-guardian');
    }
    return Promise.resolve(
      guardianId === 'gustavo' && studentId === 'rafael' ? 'granted' : 'denied',
    );
  }
}

function contextFor(request: object): ExecutionContextHost {
  const context = new ExecutionContextHost([request, {}, () => undefined]);
  context.setType('http');
  return context;
}

describe('StudentOwnershipGuard', () => {
  let checker: FakeStudentAccessChecker;
  let guard: StudentOwnershipGuard;

  beforeEach(() => {
    checker = new FakeStudentAccessChecker();
    guard = new StudentOwnershipGuard(checker);
  });

  it('libera o responsável vinculado ao aluno do params.id', async () => {
    await expect(
      guard.canActivate(
        contextFor({ user: { id: 'gustavo' }, params: { id: 'rafael' } }),
      ),
    ).resolves.toBe(true);
    expect(checker.calls).toEqual([['gustavo', 'rafael']]);
  });

  it('recusa com 403 o responsável que não é vinculado ao aluno', async () => {
    await expect(
      guard.canActivate(
        contextFor({ user: { id: 'adelaide' }, params: { id: 'rafael' } }),
      ),
    ).rejects.toThrow(new ForbiddenException(STUDENT_ACCESS_DENIED_MESSAGE));
  });

  it('dá a mesma resposta 403 para aluno inexistente (não revela se existe)', async () => {
    const notLinked = await guard
      .canActivate(
        contextFor({ user: { id: 'adelaide' }, params: { id: 'rafael' } }),
      )
      .catch((error: unknown) => error);
    const unknown = await guard
      .canActivate(
        contextFor({ user: { id: 'gustavo' }, params: { id: 'inventado' } }),
      )
      .catch((error: unknown) => error);

    expect(unknown).toBeInstanceOf(ForbiddenException);
    expect((unknown as ForbiddenException).getResponse()).toEqual(
      (notLinked as ForbiddenException).getResponse(),
    );
  });

  it('recusa com 401 o token de um responsável que não existe mais', async () => {
    await expect(
      guard.canActivate(
        contextFor({ user: { id: 'apagado' }, params: { id: 'rafael' } }),
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('recusa com 401 quando não há responsável autenticado na requisição', async () => {
    await expect(
      guard.canActivate(contextFor({ params: { id: 'rafael' } })),
    ).rejects.toThrow(UnauthorizedException);
    expect(checker.calls).toEqual([]);
  });

  it('recusa com 403 a rota sem :id, sem consultar o banco', async () => {
    await expect(
      guard.canActivate(contextFor({ user: { id: 'gustavo' }, params: {} })),
    ).rejects.toThrow(ForbiddenException);
    expect(checker.calls).toEqual([]);
  });
});

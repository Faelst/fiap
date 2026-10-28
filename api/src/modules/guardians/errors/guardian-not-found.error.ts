import { DomainError } from '../../../shared/errors/domain-error';
import { SESSION_INVALID_MESSAGE } from '../../../shared/errors/session-invalid';

/** O token é válido, mas o responsável dele não existe mais: sessão inválida. */
export class GuardianNotFoundError extends DomainError {
  readonly kind = 'unauthenticated';

  constructor() {
    super(SESSION_INVALID_MESSAGE);
  }
}

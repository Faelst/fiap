import { DomainError } from '../../../shared/errors/domain-error';

export const INVALID_CREDENTIALS_MESSAGE = 'Usuário ou senha inválida.';

/** CPF não cadastrado ou senha errada: a mesma mensagem nos dois casos. */
export class InvalidCredentialsError extends DomainError {
  readonly kind = 'unauthenticated';

  constructor() {
    super(INVALID_CREDENTIALS_MESSAGE);
  }
}

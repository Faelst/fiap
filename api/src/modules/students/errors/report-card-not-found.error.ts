import { DomainError } from '../../../shared/errors/domain-error';

export const REPORT_CARD_NOT_FOUND_MESSAGE = 'Boletim não encontrado.';

export class ReportCardNotFoundError extends DomainError {
  readonly kind = 'not-found';

  constructor() {
    super(REPORT_CARD_NOT_FOUND_MESSAGE);
  }
}

/**
 * Categoria do erro de domínio. O use case diz o que aconteceu; quem traduz
 * para HTTP é o DomainErrorFilter (D18: use case não conhece HTTP).
 */
export type DomainErrorKind = 'unauthenticated' | 'forbidden' | 'not-found';

export abstract class DomainError extends Error {
  abstract readonly kind: DomainErrorKind;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

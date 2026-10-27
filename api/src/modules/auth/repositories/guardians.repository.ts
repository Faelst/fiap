export const GUARDIANS_REPOSITORY = Symbol('GUARDIANS_REPOSITORY');

/** O que o login precisa saber de um responsável. */
export interface GuardianCredentials {
  id: string;
  /** Só dígitos (11). */
  cpf: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
}

export interface GuardiansRepository {
  /** `cpf` só com dígitos. */
  findCredentialsByCpf(cpf: string): Promise<GuardianCredentials | null>;
}

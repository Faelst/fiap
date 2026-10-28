export const GUARDIAN_CREDENTIALS_REPOSITORY = Symbol(
  'GUARDIAN_CREDENTIALS_REPOSITORY',
);

/** O que o login precisa saber de um responsável. */
export interface GuardianCredentials {
  id: string;
  /** Só dígitos (11). */
  cpf: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
}

export interface GuardianCredentialsRepository {
  /** `cpf` só com dígitos. */
  findCredentialsByCpf(cpf: string): Promise<GuardianCredentials | null>;
}

export const GUARDIAN_PROFILES_REPOSITORY = Symbol(
  'GUARDIAN_PROFILES_REPOSITORY',
);

export interface GuardianStudentSummary {
  id: string;
  rm: number;
  firstName: string;
  lastName: string;
  className: string;
  period: string;
}

/** O que o `/me` precisa saber de um responsável. */
export interface GuardianProfile {
  id: string;
  firstName: string;
  lastName: string;
  /** Só dígitos (11). Sai mascarado na resposta. */
  cpf: string;
  students: GuardianStudentSummary[];
}

export interface GuardianProfilesRepository {
  findProfileById(id: string): Promise<GuardianProfile | null>;
}

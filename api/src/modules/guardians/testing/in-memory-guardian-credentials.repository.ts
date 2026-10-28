import {
  GuardianCredentials,
  GuardianCredentialsRepository,
} from '../repositories/guardian-credentials.repository';

/** Repositório falso do spec do login. */
export class InMemoryGuardianCredentialsRepository implements GuardianCredentialsRepository {
  constructor(private readonly guardians: GuardianCredentials[]) {}

  findCredentialsByCpf(cpf: string): Promise<GuardianCredentials | null> {
    return Promise.resolve(
      this.guardians.find((guardian) => guardian.cpf === cpf) ?? null,
    );
  }
}

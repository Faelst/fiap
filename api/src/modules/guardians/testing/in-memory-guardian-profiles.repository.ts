import {
  GuardianProfile,
  GuardianProfilesRepository,
} from '../repositories/guardian-profiles.repository';

/** Repositório falso do spec do /me. */
export class InMemoryGuardianProfilesRepository implements GuardianProfilesRepository {
  constructor(private readonly profiles: GuardianProfile[]) {}

  findProfileById(id: string): Promise<GuardianProfile | null> {
    return Promise.resolve(
      this.profiles.find((profile) => profile.id === id) ?? null,
    );
  }
}

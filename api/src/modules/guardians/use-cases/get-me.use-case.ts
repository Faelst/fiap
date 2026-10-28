import { Inject, Injectable } from '@nestjs/common';
import { GuardianNotFoundError } from '../errors/guardian-not-found.error';
import { maskCpf } from '../../../shared/utils/mask-cpf';
import {
  GUARDIAN_PROFILES_REPOSITORY,
  type GuardianProfilesRepository,
  type GuardianStudentSummary,
} from '../repositories/guardian-profiles.repository';

export interface GetMeInput {
  guardianId: string;
}

export interface GetMeOutput {
  id: string;
  firstName: string;
  lastName: string;
  /** Mascarado: `***.294.560-**`. */
  cpf: string;
  /** Na ordem do vínculo (a do JSON oficial), não alfabética. */
  students: GuardianStudentSummary[];
}

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(GUARDIAN_PROFILES_REPOSITORY)
    private readonly profiles: GuardianProfilesRepository,
  ) {}

  async execute({ guardianId }: GetMeInput): Promise<GetMeOutput> {
    const profile = await this.profiles.findProfileById(guardianId);
    if (!profile) {
      // Token válido de um responsável que não existe mais.
      throw new GuardianNotFoundError();
    }

    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      cpf: maskCpf(profile.cpf),
      students: profile.students,
    };
  }
}

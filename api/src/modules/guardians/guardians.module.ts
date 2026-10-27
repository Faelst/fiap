import { Module } from '@nestjs/common';
import { MeController } from './controllers/me.controller';
import { GUARDIAN_PROFILES_REPOSITORY } from './repositories/guardian-profiles.repository';
import { PrismaGuardianProfilesRepository } from './repositories/prisma-guardian-profiles.repository';
import { GetMeUseCase } from './use-cases/get-me.use-case';

@Module({
  controllers: [MeController],
  providers: [
    GetMeUseCase,
    {
      provide: GUARDIAN_PROFILES_REPOSITORY,
      useClass: PrismaGuardianProfilesRepository,
    },
  ],
})
export class GuardiansModule {}

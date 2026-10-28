import { Module } from '@nestjs/common';
import { MeController } from './controllers/me.controller';
import { GUARDIAN_CREDENTIALS_REPOSITORY } from './repositories/guardian-credentials.repository';
import { GUARDIAN_PROFILES_REPOSITORY } from './repositories/guardian-profiles.repository';
import { PrismaGuardianCredentialsRepository } from './repositories/prisma-guardian-credentials.repository';
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
    {
      provide: GUARDIAN_CREDENTIALS_REPOSITORY,
      useClass: PrismaGuardianCredentialsRepository,
    },
  ],
  // O login (AuthModule) busca as credenciais por aqui.
  exports: [GUARDIAN_CREDENTIALS_REPOSITORY],
})
export class GuardiansModule {}

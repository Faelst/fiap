import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import {
  GuardianCredentials,
  GuardianCredentialsRepository,
} from './guardian-credentials.repository';

@Injectable()
export class PrismaGuardianCredentialsRepository implements GuardianCredentialsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findCredentialsByCpf(cpf: string): Promise<GuardianCredentials | null> {
    return this.prisma.guardian.findUnique({
      where: { cpf },
      select: {
        id: true,
        cpf: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import {
  GuardianCredentials,
  GuardiansRepository,
} from './guardians.repository';

@Injectable()
export class PrismaGuardiansRepository implements GuardiansRepository {
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

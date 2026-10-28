import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import {
  GuardianProfile,
  GuardianProfilesRepository,
} from './guardian-profiles.repository';

@Injectable()
export class PrismaGuardianProfilesRepository implements GuardianProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProfileById(id: string): Promise<GuardianProfile | null> {
    const guardian = await this.prisma.guardian.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        cpf: true,
        students: {
          // rm desempata, para a ordem nunca depender do plano do SQLite.
          orderBy: [{ position: 'asc' }, { student: { rm: 'asc' } }],
          select: {
            student: {
              select: {
                id: true,
                rm: true,
                firstName: true,
                lastName: true,
                className: true,
                period: true,
              },
            },
          },
        },
      },
    });
    if (!guardian) {
      return null;
    }

    return {
      ...guardian,
      students: guardian.students.map(({ student }) => student),
    };
  }
}

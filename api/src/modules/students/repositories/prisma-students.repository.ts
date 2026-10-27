import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/prisma/prisma.service';
import type {
  StudentAccess,
  StudentAccessChecker,
} from '../../../shared/guards/student-ownership.guard';
import {
  AgendaDayRecord,
  ReportCardRecord,
  ReportCardSummary,
  StudentsRepository,
} from './students.repository';

@Injectable()
export class PrismaStudentsRepository
  implements StudentsRepository, StudentAccessChecker
{
  constructor(private readonly prisma: PrismaService) {}

  /** Uma consulta só: o responsável e, se houver, o vínculo com o aluno. */
  async checkAccess(
    guardianId: string,
    studentId: string,
  ): Promise<StudentAccess> {
    const guardian = await this.prisma.guardian.findUnique({
      where: { id: guardianId },
      select: {
        students: { where: { studentId }, select: { studentId: true } },
      },
    });
    if (!guardian) {
      return 'unknown-guardian';
    }
    return guardian.students.length > 0 ? 'granted' : 'denied';
  }

  findAgendaDays(studentId: string): Promise<AgendaDayRecord[]> {
    return this.prisma.agendaDay.findMany({
      where: { studentId },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        lessons: {
          orderBy: [{ startTime: 'asc' }, { order: 'asc' }],
          select: {
            startTime: true,
            endTime: true,
            subject: true,
            order: true,
          },
        },
      },
    });
  }

  listReportCards(studentId: string): Promise<ReportCardSummary[]> {
    return this.prisma.reportCard.findMany({
      where: { studentId },
      orderBy: { year: 'desc' },
      select: { year: true, className: true },
    });
  }

  findReportCard(
    studentId: string,
    year: number,
  ): Promise<ReportCardRecord | null> {
    return this.prisma.reportCard.findUnique({
      where: { studentId_year: { studentId, year } },
      select: {
        year: true,
        className: true,
        termResults: {
          orderBy: [{ term: 'asc' }, { order: 'asc' }],
          select: {
            term: true,
            subject: true,
            grade: true,
            absences: true,
            order: true,
          },
        },
      },
    });
  }
}

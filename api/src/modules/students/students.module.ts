import { Module } from '@nestjs/common';
import {
  STUDENT_ACCESS_CHECKER,
  StudentOwnershipGuard,
} from '../../shared/guards/student-ownership.guard';
import { StudentsController } from './controllers/students.controller';
import { PrismaStudentsRepository } from './repositories/prisma-students.repository';
import { STUDENTS_REPOSITORY } from './repositories/students.repository';
import { GetReportCardUseCase } from './use-cases/get-report-card.use-case';
import { GetStudentAgendaUseCase } from './use-cases/get-student-agenda.use-case';
import { ListReportCardsUseCase } from './use-cases/list-report-cards.use-case';

@Module({
  controllers: [StudentsController],
  providers: [
    GetStudentAgendaUseCase,
    ListReportCardsUseCase,
    GetReportCardUseCase,
    StudentOwnershipGuard,
    PrismaStudentsRepository,
    { provide: STUDENTS_REPOSITORY, useExisting: PrismaStudentsRepository },
    { provide: STUDENT_ACCESS_CHECKER, useExisting: PrismaStudentsRepository },
  ],
})
export class StudentsModule {}

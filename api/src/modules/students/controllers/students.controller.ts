import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { StudentOwnership } from '../../../shared/guards/student-ownership.guard';
import type { ReportCardSummary } from '../repositories/students.repository';
import {
  ReportCard,
  GetReportCardUseCase,
} from '../use-cases/get-report-card.use-case';
import {
  AgendaDay,
  GetStudentAgendaUseCase,
} from '../use-cases/get-student-agenda.use-case';
import { ListReportCardsUseCase } from '../use-cases/list-report-cards.use-case';

/** Todas as rotas são de um aluno (`:id`) e passam pelo guard de ownership. */
@StudentOwnership()
@Controller('students/:id')
export class StudentsController {
  constructor(
    private readonly getStudentAgenda: GetStudentAgendaUseCase,
    private readonly listReportCards: ListReportCardsUseCase,
    private readonly getReportCard: GetReportCardUseCase,
  ) {}

  @Get('agenda')
  agenda(@Param('id') id: string): Promise<AgendaDay[]> {
    return this.getStudentAgenda.execute({ studentId: id });
  }

  @Get('report-cards')
  reportCards(@Param('id') id: string): Promise<ReportCardSummary[]> {
    return this.listReportCards.execute({ studentId: id });
  }

  @Get('report-cards/:year')
  reportCard(
    @Param('id') id: string,
    @Param('year', ParseIntPipe) year: number,
  ): Promise<ReportCard> {
    return this.getReportCard.execute({ studentId: id, year });
  }
}

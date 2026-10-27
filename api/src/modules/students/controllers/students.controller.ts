import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RawParam } from '../../../shared/decorators/raw-param';
import { StudentOwnership } from '../../../shared/guards/student-ownership.guard';
import { ParseYearPipe } from '../../../shared/pipes/parse-year.pipe';
import { ApiStudentRoute } from '../../../shared/swagger/api-docs';
import { ErrorResponse } from '../../../shared/swagger/error-response';
import { AgendaDayResponse } from '../dto/agenda.response';
import {
  ReportCardResponse,
  ReportCardSummaryResponse,
} from '../dto/report-card.response';
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
@ApiTags('students')
@ApiStudentRoute()
@ApiParam({
  name: 'id',
  description: 'Id do aluno (vem em `students` do GET /api/me).',
  example: 'cmhz0student000000000001',
})
@StudentOwnership()
@Controller('students/:id')
export class StudentsController {
  constructor(
    private readonly getStudentAgenda: GetStudentAgendaUseCase,
    private readonly listReportCards: ListReportCardsUseCase,
    private readonly getReportCard: GetReportCardUseCase,
  ) {}

  @Get('agenda')
  @ApiOperation({
    summary: 'Agenda da semana do aluno',
    description:
      'Dias em ordem de data e aulas por horário; dia sem aula vem com `lessons: []`.',
  })
  @ApiOkResponse({ type: [AgendaDayResponse] })
  agenda(@Param('id') id: string): Promise<AgendaDay[]> {
    return this.getStudentAgenda.execute({ studentId: id });
  }

  @Get('report-cards')
  @ApiOperation({
    summary: 'Anos com boletim do aluno (mais recente primeiro)',
  })
  @ApiOkResponse({ type: [ReportCardSummaryResponse] })
  reportCards(@Param('id') id: string): Promise<ReportCardSummary[]> {
    return this.listReportCards.execute({ studentId: id });
  }

  @Get('report-cards/:year')
  @ApiOperation({
    summary: 'Boletim do aluno no ano (notas e faltas por trimestre)',
  })
  @ApiParam({
    name: 'year',
    description: 'Ano com 4 dígitos.',
    schema: { type: 'string', pattern: '^\\d{4}$', example: '2025' },
  })
  @ApiOkResponse({ type: ReportCardResponse })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'Ano fora do formato de 4 dígitos.',
  })
  @ApiNotFoundResponse({
    type: ErrorResponse,
    description: 'O aluno não tem boletim nesse ano.',
  })
  reportCard(
    @Param('id') id: string,
    // RawParam, e não Param: o pipe precisa do texto cru (ver raw-param.ts).
    @RawParam('year', ParseYearPipe) year: number,
  ): Promise<ReportCard> {
    return this.getReportCard.execute({ studentId: id, year });
  }
}

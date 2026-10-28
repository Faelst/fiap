import { ApiProperty } from '@nestjs/swagger';
import type {
  AgendaDay,
  AgendaLesson,
} from '../use-cases/get-student-agenda.use-case';

export class AgendaLessonResponse implements AgendaLesson {
  @ApiProperty({ example: '07:15' })
  startTime!: string;

  @ApiProperty({ example: '08:00' })
  endTime!: string;

  @ApiProperty({ example: 'Matemática I' })
  subject!: string;
}

export class AgendaDayResponse implements AgendaDay {
  @ApiProperty({ format: 'date', example: '2025-03-17' })
  date!: string;

  @ApiProperty({
    type: [AgendaLessonResponse],
    description: 'Ordenadas por horário. Vazia em dia sem aula.',
  })
  lessons!: AgendaLessonResponse[];
}

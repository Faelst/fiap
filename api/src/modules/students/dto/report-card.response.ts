import { ApiProperty } from '@nestjs/swagger';
import type { ReportCardSummary } from '../repositories/students.repository';
import type {
  ReportCard,
  ReportCardSubject,
  ReportCardTerm,
} from '../use-cases/get-report-card.use-case';

export class ReportCardSummaryResponse implements ReportCardSummary {
  @ApiProperty({ example: 2025 })
  year!: number;

  @ApiProperty({ example: '7EF' })
  className!: string;
}

export class ReportCardSubjectResponse implements ReportCardSubject {
  @ApiProperty({ example: 'Língua Portuguesa' })
  name!: string;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'null = ainda não avaliado.',
    example: 9.5,
  })
  grade!: number | null;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'null = ainda não avaliado.',
    example: 0,
  })
  absences!: number | null;
}

export class ReportCardTermResponse implements ReportCardTerm {
  @ApiProperty({ enum: [1, 2, 3], example: 1 })
  term!: number;

  @ApiProperty({ type: [ReportCardSubjectResponse] })
  subjects!: ReportCardSubjectResponse[];
}

export class ReportCardResponse implements ReportCard {
  @ApiProperty({ example: 2025 })
  year!: number;

  @ApiProperty({ example: '7EF' })
  className!: string;

  @ApiProperty({
    type: [ReportCardTermResponse],
    description: 'Sempre os trimestres 1, 2 e 3, avaliados ou não.',
  })
  terms!: ReportCardTermResponse[];
}

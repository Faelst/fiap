import { Inject, Injectable } from '@nestjs/common';
import {
  type ReportCardSummary,
  STUDENTS_REPOSITORY,
  type StudentsRepository,
} from '../repositories/students.repository';

export interface ListReportCardsInput {
  studentId: string;
}

@Injectable()
export class ListReportCardsUseCase {
  constructor(
    @Inject(STUDENTS_REPOSITORY)
    private readonly students: StudentsRepository,
  ) {}

  async execute({
    studentId,
  }: ListReportCardsInput): Promise<ReportCardSummary[]> {
    const cards = await this.students.listReportCards(studentId);

    return cards
      .toSorted((a, b) => b.year - a.year)
      .map(({ year, className }) => ({ year, className }));
  }
}

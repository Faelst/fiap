import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  STUDENTS_REPOSITORY,
  type StudentsRepository,
} from '../repositories/students.repository';

export const REPORT_CARD_NOT_FOUND_MESSAGE = 'Boletim não encontrado.';

/** O boletim sempre tem os três trimestres, avaliados ou não. */
const TERMS = [1, 2, 3] as const;
const MIN_YEAR = 1;
const MAX_YEAR = 9999;

export interface GetReportCardInput {
  studentId: string;
  year: number;
}

export interface ReportCardSubject {
  name: string;
  /** null = ainda não avaliado. */
  grade: number | null;
  /** null = ainda não avaliado. */
  absences: number | null;
}

export interface ReportCardTerm {
  term: number;
  subjects: ReportCardSubject[];
}

export interface ReportCard {
  year: number;
  className: string;
  terms: ReportCardTerm[];
}

@Injectable()
export class GetReportCardUseCase {
  constructor(
    @Inject(STUDENTS_REPOSITORY)
    private readonly students: StudentsRepository,
  ) {}

  async execute({ studentId, year }: GetReportCardInput): Promise<ReportCard> {
    // Ano fora da faixa nunca tem boletim. Também evita mandar ao Prisma um
    // inteiro acima de 64 bits, que vira erro 500 em vez de 404.
    if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
      throw new NotFoundException(REPORT_CARD_NOT_FOUND_MESSAGE);
    }

    const card = await this.students.findReportCard(studentId, year);
    if (!card) {
      throw new NotFoundException(REPORT_CARD_NOT_FOUND_MESSAGE);
    }

    return {
      year: card.year,
      className: card.className,
      terms: TERMS.map((term) => ({
        term,
        subjects: card.termResults
          .filter((result) => result.term === term)
          .toSorted((a, b) => a.order - b.order)
          .map(({ subject, grade, absences }) => ({
            name: subject,
            grade,
            absences,
          })),
      })),
    };
  }
}

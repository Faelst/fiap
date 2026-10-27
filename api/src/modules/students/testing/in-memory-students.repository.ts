import {
  AgendaDayRecord,
  ReportCardRecord,
  ReportCardSummary,
  StudentsRepository,
} from '../repositories/students.repository';

export interface InMemoryStudent {
  id: string;
  agendaDays: AgendaDayRecord[];
  reportCards: ReportCardRecord[];
}

/** Repositório falso dos specs dos use cases de aluno. */
export class InMemoryStudentsRepository implements StudentsRepository {
  readonly calls: string[] = [];

  constructor(private readonly students: InMemoryStudent[]) {}

  findAgendaDays(studentId: string): Promise<AgendaDayRecord[]> {
    this.calls.push('findAgendaDays');
    return Promise.resolve(this.find(studentId)?.agendaDays ?? []);
  }

  listReportCards(studentId: string): Promise<ReportCardSummary[]> {
    this.calls.push('listReportCards');
    return Promise.resolve(
      (this.find(studentId)?.reportCards ?? []).map(({ year, className }) => ({
        year,
        className,
      })),
    );
  }

  findReportCard(
    studentId: string,
    year: number,
  ): Promise<ReportCardRecord | null> {
    this.calls.push('findReportCard');
    return Promise.resolve(
      this.find(studentId)?.reportCards.find((card) => card.year === year) ??
        null,
    );
  }

  private find(studentId: string): InMemoryStudent | undefined {
    return this.students.find((student) => student.id === studentId);
  }
}

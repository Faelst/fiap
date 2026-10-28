export const STUDENTS_REPOSITORY = Symbol('STUDENTS_REPOSITORY');

export interface LessonRecord {
  /** "HH:MM". */
  startTime: string;
  /** "HH:MM". */
  endTime: string;
  subject: string;
  /** Posição da aula no dia, na ordem do JSON. */
  order: number;
}

export interface AgendaDayRecord {
  /** "YYYY-MM-DD". */
  date: string;
  lessons: LessonRecord[];
}

export interface ReportCardSummary {
  year: number;
  className: string;
}

export interface TermResultRecord {
  term: number;
  subject: string;
  grade: number | null;
  absences: number | null;
  /** Posição da disciplina no trimestre, na ordem do JSON. */
  order: number;
}

export interface ReportCardRecord extends ReportCardSummary {
  termResults: TermResultRecord[];
}

/** Leituras por aluno. O vínculo com o responsável já foi conferido no guard. */
export interface StudentsRepository {
  findAgendaDays(studentId: string): Promise<AgendaDayRecord[]>;
  listReportCards(studentId: string): Promise<ReportCardSummary[]>;
  findReportCard(
    studentId: string,
    year: number,
  ): Promise<ReportCardRecord | null>;
}

// Converte o JSON oficial do teste (prisma/seed-data/responsaveis.json) nos
// registros do banco. Função pura: o seed.ts só gera o hash das senhas e grava.

export interface RawLesson {
  horario: string;
  disciplina: string;
}

export interface RawAgendaDay {
  dia: string;
  aulas: RawLesson[];
}

export interface RawSubjectResult {
  nome: string;
  nota: number | null;
  faltas: number | null;
}

export interface RawTerm {
  trimestre: number;
  disciplinas: RawSubjectResult[];
}

export interface RawReportCard {
  ano: string;
  turma: string;
  trimestres: RawTerm[];
}

export interface RawStudent {
  rm: number;
  turma: string;
  periodo: string;
  primeiroNome: string;
  sobrenome: string;
  agenda: RawAgendaDay[];
  boletim: RawReportCard[];
}

export interface RawGuardian {
  id: number;
  cpf: string;
  email: string;
  senha: string;
  primeiroNome: string;
  sobrenome: string;
  alunos: RawStudent[];
}

export interface SeedLesson {
  startTime: string;
  endTime: string;
  subject: string;
  order: number;
}

export interface SeedAgendaDay {
  date: string;
  lessons: SeedLesson[];
}

export interface SeedTermResult {
  term: number;
  subject: string;
  grade: number | null;
  absences: number | null;
  order: number;
}

export interface SeedReportCard {
  year: number;
  className: string;
  termResults: SeedTermResult[];
}

export interface SeedStudent {
  rm: number;
  firstName: string;
  lastName: string;
  className: string;
  period: string;
  agenda: SeedAgendaDay[];
  reportCards: SeedReportCard[];
}

export interface SeedGuardian {
  cpf: string;
  email: string;
  /** Texto puro: o seed gera o hash bcrypt antes de gravar. */
  password: string;
  firstName: string;
  lastName: string;
  studentRms: number[];
}

export interface SeedPlan {
  guardians: SeedGuardian[];
  students: SeedStudent[];
}

/**
 * Responsável extra, sem aluno vinculado, para o cenário de erro do app.
 * Não existe no JSON oficial; o CPF é fictício e tem dígitos verificadores válidos.
 */
export const GUARDIAN_WITHOUT_STUDENTS: SeedGuardian = {
  cpf: '31415926590',
  email: 'carlos@example.com',
  password: '111111',
  firstName: 'Carlos',
  lastName: 'Sem Aluno',
  studentRms: [],
};

const TIME_RANGE = /^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/;
const YEAR = /^\d{4}$/;

export function splitTimeRange(value: string): {
  startTime: string;
  endTime: string;
} {
  const match = TIME_RANGE.exec(value.trim());
  if (!match) {
    throw new Error(`Horário inválido no JSON: "${value}"`);
  }
  return { startTime: match[1], endTime: match[2] };
}

function parseYear(value: string): number {
  if (!YEAR.test(value.trim())) {
    throw new Error(`Ano inválido no boletim: "${value}"`);
  }
  return Number(value);
}

function mapAgendaDay(day: RawAgendaDay): SeedAgendaDay {
  return {
    date: day.dia,
    lessons: day.aulas.map((lesson, order) => ({
      ...splitTimeRange(lesson.horario),
      subject: lesson.disciplina,
      order,
    })),
  };
}

function mapReportCard(card: RawReportCard): SeedReportCard {
  return {
    year: parseYear(card.ano),
    className: card.turma,
    termResults: card.trimestres.flatMap((term) =>
      term.disciplinas.map((subject, order) => ({
        term: term.trimestre,
        subject: subject.nome,
        grade: subject.nota,
        absences: subject.faltas,
        order,
      })),
    ),
  };
}

function mapStudent(student: RawStudent): SeedStudent {
  return {
    rm: student.rm,
    firstName: student.primeiroNome,
    lastName: student.sobrenome,
    className: student.turma,
    period: student.periodo,
    agenda: student.agenda.map(mapAgendaDay),
    reportCards: student.boletim.map(mapReportCard),
  };
}

export function mapSeed(raw: RawGuardian[]): SeedPlan {
  const students = new Map<number, SeedStudent>();

  const guardians = raw.map((guardian) => {
    for (const student of guardian.alunos) {
      if (!students.has(student.rm)) {
        students.set(student.rm, mapStudent(student));
      }
    }
    return {
      cpf: guardian.cpf.replace(/\D/g, ''),
      email: guardian.email,
      password: guardian.senha,
      firstName: guardian.primeiroNome,
      lastName: guardian.sobrenome,
      studentRms: guardian.alunos.map((student) => student.rm),
    };
  });

  return { guardians, students: [...students.values()] };
}

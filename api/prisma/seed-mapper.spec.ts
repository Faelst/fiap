import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  GUARDIAN_WITHOUT_STUDENTS,
  mapSeed,
  RawGuardian,
  splitTimeRange,
} from './seed-mapper';

function cpfCheckDigit(digits: number[]): number {
  const weightStart = digits.length + 1;
  const sum = digits.reduce((acc, d, i) => acc + d * (weightStart - i), 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

function hasValidCpfDigits(cpf: string): boolean {
  const digits = cpf.split('').map(Number);
  const first = cpfCheckDigit(digits.slice(0, 9));
  const second = cpfCheckDigit([...digits.slice(0, 9), first]);
  return digits[9] === first && digits[10] === second;
}

function rawGuardian(overrides: Partial<RawGuardian> = {}): RawGuardian {
  return {
    id: 1,
    cpf: '96929456004',
    email: 'gustavo@example.com',
    senha: '123456',
    primeiroNome: 'Gustavo',
    sobrenome: 'da Silva',
    alunos: [
      {
        rm: 12567,
        turma: '7EF',
        periodo: 'Matutino',
        primeiroNome: 'Rafael',
        sobrenome: 'da Silva',
        agenda: [
          { dia: '2025-03-16', aulas: [] },
          {
            dia: '2025-03-17',
            aulas: [
              { horario: '10:00 - 10:45', disciplina: 'Ciências' },
              { horario: '07:15 - 08:00', disciplina: 'Matemática I' },
            ],
          },
        ],
        boletim: [
          {
            ano: '2025',
            turma: '7EF',
            trimestres: [
              {
                trimestre: 1,
                disciplinas: [
                  { nome: 'Língua Portuguesa', nota: 9.5, faltas: 0 },
                  { nome: 'Arte', nota: 7, faltas: 2 },
                ],
              },
              {
                trimestre: 2,
                disciplinas: [
                  { nome: 'Língua Portuguesa', nota: null, faltas: null },
                ],
              },
            ],
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe('splitTimeRange', () => {
  it('separa "07:15 - 08:00" em início e fim', () => {
    expect(splitTimeRange('07:15 - 08:00')).toEqual({
      startTime: '07:15',
      endTime: '08:00',
    });
  });

  it('aceita o horário sem espaços em volta do hífen', () => {
    expect(splitTimeRange('13:15-14:00')).toEqual({
      startTime: '13:15',
      endTime: '14:00',
    });
  });

  it.each(['', '07:15', '7:15 - 08:00', '07:15 - 08:00 - 09:00', 'aula'])(
    'recusa o horário malformado "%s"',
    (value) => {
      expect(() => splitTimeRange(value)).toThrow(/horário inválido/i);
    },
  );
});

describe('mapSeed', () => {
  it('mapeia os dados do responsável e mantém a senha em texto para o seed gerar o hash', () => {
    const { guardians } = mapSeed([rawGuardian()]);

    expect(guardians).toEqual([
      {
        cpf: '96929456004',
        email: 'gustavo@example.com',
        password: '123456',
        firstName: 'Gustavo',
        lastName: 'da Silva',
        studentRms: [12567],
      },
    ]);
  });

  it('guarda o CPF só com dígitos', () => {
    const { guardians } = mapSeed([rawGuardian({ cpf: '969.294.560-04' })]);

    expect(guardians[0].cpf).toBe('96929456004');
  });

  it('mapeia o aluno', () => {
    const { students } = mapSeed([rawGuardian()]);

    expect(students[0]).toMatchObject({
      rm: 12567,
      firstName: 'Rafael',
      lastName: 'da Silva',
      className: '7EF',
      period: 'Matutino',
    });
  });

  it('divide o horário das aulas e preserva a ordem do JSON', () => {
    const { students } = mapSeed([rawGuardian()]);

    expect(students[0].agenda[1]).toEqual({
      date: '2025-03-17',
      lessons: [
        { startTime: '10:00', endTime: '10:45', subject: 'Ciências', order: 0 },
        {
          startTime: '07:15',
          endTime: '08:00',
          subject: 'Matemática I',
          order: 1,
        },
      ],
    });
  });

  it('mantém o dia sem aulas com a lista vazia', () => {
    const { students } = mapSeed([rawGuardian()]);

    expect(students[0].agenda[0]).toEqual({ date: '2025-03-16', lessons: [] });
  });

  it('converte o ano do boletim de texto para inteiro', () => {
    const { students } = mapSeed([rawGuardian()]);

    expect(students[0].reportCards[0].year).toBe(2025);
    expect(students[0].reportCards[0].className).toBe('7EF');
  });

  it('recusa ano do boletim que não é número', () => {
    const raw = rawGuardian();
    raw.alunos[0].boletim[0].ano = 'dois mil';

    expect(() => mapSeed([raw])).toThrow(/ano inválido/i);
  });

  it('achata os trimestres em resultados com a ordem das disciplinas preservada', () => {
    const { students } = mapSeed([rawGuardian()]);

    expect(students[0].reportCards[0].termResults).toEqual([
      {
        term: 1,
        subject: 'Língua Portuguesa',
        grade: 9.5,
        absences: 0,
        order: 0,
      },
      { term: 1, subject: 'Arte', grade: 7, absences: 2, order: 1 },
      {
        term: 2,
        subject: 'Língua Portuguesa',
        grade: null,
        absences: null,
        order: 0,
      },
    ]);
  });

  it('mantém nota e falta null como null, e zero como zero', () => {
    const { students } = mapSeed([rawGuardian()]);
    const [first, , third] = students[0].reportCards[0].termResults;

    expect(first.absences).toBe(0);
    expect(third.grade).toBeNull();
    expect(third.absences).toBeNull();
  });

  it('cria um aluno só quando dois responsáveis têm o mesmo RM', () => {
    const second = rawGuardian({
      id: 2,
      cpf: '50879567007',
      email: 'outra@example.com',
    });

    const { guardians, students } = mapSeed([rawGuardian(), second]);

    expect(students).toHaveLength(1);
    expect(guardians.map((g) => g.studentRms)).toEqual([[12567], [12567]]);
  });
});

describe('GUARDIAN_WITHOUT_STUDENTS', () => {
  it('é o responsável extra sem aluno, com CPF de dígitos verificadores válidos', () => {
    expect(GUARDIAN_WITHOUT_STUDENTS).toEqual({
      cpf: '31415926590',
      email: 'carlos@example.com',
      password: '111111',
      firstName: 'Carlos',
      lastName: 'Sem Aluno',
      studentRms: [],
    });
    expect(hasValidCpfDigits(GUARDIAN_WITHOUT_STUDENTS.cpf)).toBe(true);
  });
});

describe('mapSeed com o JSON oficial', () => {
  const raw = JSON.parse(
    readFileSync(join(__dirname, 'seed-data', 'responsaveis.json'), 'utf8'),
  ) as RawGuardian[];
  const { guardians, students } = mapSeed(raw);
  const byRm = (rm: number) => students.find((s) => s.rm === rm)!;

  it('tem os 2 responsáveis e os 3 alunos', () => {
    expect(guardians.map((g) => g.firstName)).toEqual(['Gustavo', 'Adelaide']);
    expect(guardians.map((g) => g.studentRms)).toEqual([
      [12567, 12568],
      [13752],
    ]);
    expect(students.map((s) => s.firstName)).toEqual([
      'Rafael',
      'Joana',
      'Bianca',
    ]);
  });

  it('tem os 7 dias da agenda, com sábado e domingo vazios', () => {
    const agenda = byRm(12567).agenda;

    expect(agenda.map((d) => d.date)).toEqual([
      '2025-03-16',
      '2025-03-17',
      '2025-03-18',
      '2025-03-19',
      '2025-03-20',
      '2025-03-21',
      '2025-03-22',
    ]);
    expect(agenda.map((d) => d.lessons.length)).toEqual([0, 6, 6, 6, 6, 6, 0]);
  });

  it('Rafael tem boletim de 2025 (7EF) e 2024 (6EF)', () => {
    expect(byRm(12567).reportCards.map((r) => [r.year, r.className])).toEqual([
      [2025, '7EF'],
      [2024, '6EF'],
    ]);
  });

  it('Rafael em 2025 tem 12 disciplinas avaliadas no T1 e T2/T3 sem nota nem falta', () => {
    const results = byRm(12567).reportCards[0].termResults;
    const term = (t: number) => results.filter((r) => r.term === t);

    expect(term(1)).toHaveLength(12);
    expect(term(1).every((r) => r.grade !== null && r.absences !== null)).toBe(
      true,
    );
    expect(term(2)).toHaveLength(12);
    expect(term(3)).toHaveLength(12);
    expect(
      [...term(2), ...term(3)].every(
        (r) => r.grade === null && r.absences === null,
      ),
    ).toBe(true);
  });

  it('Bianca tem 11 disciplinas no T1, como no JSON', () => {
    const results = byRm(13752).reportCards[0].termResults;

    expect(results.filter((r) => r.term === 1)).toHaveLength(11);
  });
});

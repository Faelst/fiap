import {
  REPORT_CARD_NOT_FOUND_MESSAGE,
  ReportCardNotFoundError,
} from '../errors/report-card-not-found.error';
import { TermResultRecord } from '../repositories/students.repository';
import { InMemoryStudentsRepository } from '../testing/in-memory-students.repository';
import { GetReportCardUseCase } from './get-report-card.use-case';

const result = (
  term: number,
  order: number,
  subject: string,
  grade: number | null,
  absences: number | null,
): TermResultRecord => ({ term, order, subject, grade, absences });

describe('GetReportCardUseCase', () => {
  let repository: InMemoryStudentsRepository;
  let useCase: GetReportCardUseCase;

  beforeEach(() => {
    repository = new InMemoryStudentsRepository([
      {
        id: 'rafael',
        agendaDays: [],
        reportCards: [
          {
            year: 2025,
            className: '7EF',
            // Fora de ordem de propósito: o use case agrupa e ordena.
            termResults: [
              result(3, 0, 'Língua Portuguesa', null, null),
              result(1, 1, 'Matemática', 8, 2),
              result(2, 1, 'Matemática', null, null),
              result(1, 0, 'Língua Portuguesa', 9.5, 0),
              result(2, 0, 'Língua Portuguesa', null, null),
              result(3, 1, 'Matemática', null, null),
            ],
          },
          { year: 2024, className: '6EF', termResults: [] },
        ],
      },
    ]);
    useCase = new GetReportCardUseCase(repository);
  });

  it('agrupa por trimestre (1 a 3) com as disciplinas na ordem do JSON', async () => {
    const card = await useCase.execute({ studentId: 'rafael', year: 2025 });

    expect(card).toEqual({
      year: 2025,
      className: '7EF',
      terms: [
        {
          term: 1,
          subjects: [
            { name: 'Língua Portuguesa', grade: 9.5, absences: 0 },
            { name: 'Matemática', grade: 8, absences: 2 },
          ],
        },
        {
          term: 2,
          subjects: [
            { name: 'Língua Portuguesa', grade: null, absences: null },
            { name: 'Matemática', grade: null, absences: null },
          ],
        },
        {
          term: 3,
          subjects: [
            { name: 'Língua Portuguesa', grade: null, absences: null },
            { name: 'Matemática', grade: null, absences: null },
          ],
        },
      ],
    });
  });

  it('mantém nota 0 e falta 0 como número, sem virar null', async () => {
    repository = new InMemoryStudentsRepository([
      {
        id: 'zero',
        agendaDays: [],
        reportCards: [
          {
            year: 2025,
            className: '1EF',
            termResults: [result(1, 0, 'Arte', 0, 0)],
          },
        ],
      },
    ]);
    useCase = new GetReportCardUseCase(repository);

    const card = await useCase.execute({ studentId: 'zero', year: 2025 });

    expect(card.terms[0].subjects).toEqual([
      { name: 'Arte', grade: 0, absences: 0 },
    ]);
  });

  it('devolve sempre os 3 trimestres, mesmo sem disciplina lançada', async () => {
    const card = await useCase.execute({ studentId: 'rafael', year: 2024 });

    expect(card.terms).toEqual([
      { term: 1, subjects: [] },
      { term: 2, subjects: [] },
      { term: 3, subjects: [] },
    ]);
  });

  it('recusa com ReportCardNotFoundError o ano sem boletim', async () => {
    await expect(
      useCase.execute({ studentId: 'rafael', year: 2023 }),
    ).rejects.toThrow(new ReportCardNotFoundError());
    expect(REPORT_CARD_NOT_FOUND_MESSAGE).toBe('Boletim não encontrado.');
  });

  it.each([0, -1, 10000, 2 ** 31])(
    'recusa com ReportCardNotFoundError o ano fora de 1 a 9999 (%d) sem consultar o repositório',
    async (year) => {
      await expect(
        useCase.execute({ studentId: 'rafael', year }),
      ).rejects.toThrow(new ReportCardNotFoundError());
      expect(repository.calls).toEqual([]);
    },
  );
});

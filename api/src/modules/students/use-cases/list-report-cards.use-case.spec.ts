import { InMemoryStudentsRepository } from '../testing/in-memory-students.repository';
import { ListReportCardsUseCase } from './list-report-cards.use-case';

describe('ListReportCardsUseCase', () => {
  let useCase: ListReportCardsUseCase;

  beforeEach(() => {
    useCase = new ListReportCardsUseCase(
      new InMemoryStudentsRepository([
        {
          id: 'rafael',
          agendaDays: [],
          // Fora de ordem de propósito: o use case ordena do mais recente.
          reportCards: [
            { year: 2023, className: '5EF', termResults: [] },
            { year: 2025, className: '7EF', termResults: [] },
            { year: 2024, className: '6EF', termResults: [] },
          ],
        },
      ]),
    );
  });

  it('lista os anos do mais recente para o mais antigo, com a turma de cada ano', async () => {
    await expect(useCase.execute({ studentId: 'rafael' })).resolves.toEqual([
      { year: 2025, className: '7EF' },
      { year: 2024, className: '6EF' },
      { year: 2023, className: '5EF' },
    ]);
  });

  it('devolve [] para aluno sem boletim', async () => {
    await expect(
      useCase.execute({ studentId: 'sem-boletim' }),
    ).resolves.toEqual([]);
  });
});

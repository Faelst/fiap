import { InMemoryStudentsRepository } from '../testing/in-memory-students.repository';
import { GetStudentAgendaUseCase } from './get-student-agenda.use-case';

const lesson = (
  startTime: string,
  endTime: string,
  subject: string,
  order: number,
) => ({ startTime, endTime, subject, order });

describe('GetStudentAgendaUseCase', () => {
  let repository: InMemoryStudentsRepository;
  let useCase: GetStudentAgendaUseCase;

  beforeEach(() => {
    repository = new InMemoryStudentsRepository([
      {
        id: 'rafael',
        reportCards: [],
        // Fora de ordem de propósito: o use case ordena dias e aulas.
        agendaDays: [
          {
            date: '2025-03-18',
            lessons: [
              lesson('08:00', '08:45', 'Matemática II', 1),
              lesson('07:15', '08:00', 'Produção de Textos', 0),
            ],
          },
          { date: '2025-03-16', lessons: [] },
          {
            date: '2025-03-17',
            lessons: [
              lesson('09:15', '10:00', 'Língua Inglesa', 2),
              lesson('07:15', '08:00', 'Matemática I', 0),
              lesson('08:00', '08:45', 'Língua Inglesa', 1),
            ],
          },
        ],
      },
      {
        id: 'empate',
        reportCards: [],
        agendaDays: [
          {
            date: '2025-03-17',
            lessons: [
              lesson('07:15', '08:00', 'Segunda', 1),
              lesson('07:15', '08:00', 'Primeira', 0),
            ],
          },
        ],
      },
    ]);
    useCase = new GetStudentAgendaUseCase(repository);
  });

  it('devolve os dias em ordem de data, com as aulas no formato do contrato', async () => {
    const agenda = await useCase.execute({ studentId: 'rafael' });

    expect(agenda).toEqual([
      { date: '2025-03-16', lessons: [] },
      {
        date: '2025-03-17',
        lessons: [
          { startTime: '07:15', endTime: '08:00', subject: 'Matemática I' },
          { startTime: '08:00', endTime: '08:45', subject: 'Língua Inglesa' },
          { startTime: '09:15', endTime: '10:00', subject: 'Língua Inglesa' },
        ],
      },
      {
        date: '2025-03-18',
        lessons: [
          {
            startTime: '07:15',
            endTime: '08:00',
            subject: 'Produção de Textos',
          },
          { startTime: '08:00', endTime: '08:45', subject: 'Matemática II' },
        ],
      },
    ]);
  });

  it('mantém o dia sem aula com lessons: []', async () => {
    const agenda = await useCase.execute({ studentId: 'rafael' });

    expect(agenda[0]).toEqual({ date: '2025-03-16', lessons: [] });
  });

  it('desempata aulas no mesmo horário pela ordem do JSON', async () => {
    const agenda = await useCase.execute({ studentId: 'empate' });

    expect(agenda[0].lessons.map((item) => item.subject)).toEqual([
      'Primeira',
      'Segunda',
    ]);
  });

  it('não expõe o campo interno order', async () => {
    const agenda = await useCase.execute({ studentId: 'rafael' });

    for (const day of agenda) {
      for (const item of day.lessons) {
        expect(Object.keys(item).sort()).toEqual([
          'endTime',
          'startTime',
          'subject',
        ]);
      }
    }
  });

  it('devolve [] para aluno sem agenda', async () => {
    await expect(useCase.execute({ studentId: 'sem-agenda' })).resolves.toEqual(
      [],
    );
  });
});

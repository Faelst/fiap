import { agendaResponse } from '../../../test/fixtures';
import { agendaSchema } from '../schemas';

describe('agendaSchema', () => {
  it('aceita os 7 dias do contrato, inclusive dia sem aula', () => {
    const agenda = agendaSchema.parse(agendaResponse);
    expect(agenda).toHaveLength(7);
    expect(agenda[0].lessons).toEqual([]);
    expect(agenda[1].lessons[0]).toEqual({
      startTime: '07:15',
      endTime: '08:00',
      subject: 'Matemática I',
    });
  });

  it('recusa data fora de AAAA-MM-DD', () => {
    expect(
      agendaSchema.safeParse([{ date: '17/03/2025', lessons: [] }]).success,
    ).toBe(false);
  });

  it('recusa horário fora de HH:mm', () => {
    expect(
      agendaSchema.safeParse([
        {
          date: '2025-03-17',
          lessons: [{ startTime: '7:15', endTime: '08:00', subject: 'X' }],
        },
      ]).success,
    ).toBe(false);
  });

  it('recusa dia sem a lista de aulas', () => {
    expect(agendaSchema.safeParse([{ date: '2025-03-17' }]).success).toBe(
      false,
    );
  });
});

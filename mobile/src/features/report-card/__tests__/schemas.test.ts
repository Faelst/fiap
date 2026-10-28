import { reportCard2025, reportCardsResponse } from '../../../test/fixtures';
import { reportCardSchema, reportCardsSchema } from '../schemas';

describe('reportCardsSchema', () => {
  it('aceita a lista de anos', () => {
    expect(reportCardsSchema.parse(reportCardsResponse)).toEqual(
      reportCardsResponse,
    );
  });

  it('recusa ano em texto', () => {
    expect(
      reportCardsSchema.safeParse([{ year: '2025', className: '7EF' }]).success,
    ).toBe(false);
  });
});

describe('reportCardSchema', () => {
  it('aceita nota e falta lançadas e não lançadas (null)', () => {
    const card = reportCardSchema.parse(reportCard2025);
    expect(card.terms).toHaveLength(3);
    expect(card.terms[0].subjects[0]).toEqual({
      name: 'Língua Portuguesa',
      grade: 9.5,
      absences: 0,
    });
    expect(card.terms[1].subjects[0].grade).toBeNull();
  });

  it('recusa nota em texto, nota fora de 0–10 e falta negativa', () => {
    const withSubject = (subject: object) => ({
      ...reportCard2025,
      terms: [{ term: 1, subjects: [subject] }],
    });
    expect(
      reportCardSchema.safeParse(
        withSubject({ name: 'X', grade: '9,5', absences: 0 }),
      ).success,
    ).toBe(false);
    expect(
      reportCardSchema.safeParse(
        withSubject({ name: 'X', grade: 11, absences: 0 }),
      ).success,
    ).toBe(false);
    expect(
      reportCardSchema.safeParse(
        withSubject({ name: 'X', grade: 9, absences: -1 }),
      ).success,
    ).toBe(false);
  });

  it('recusa trimestre sem a chave grade (undefined não é null)', () => {
    expect(
      reportCardSchema.safeParse({
        ...reportCard2025,
        terms: [{ term: 1, subjects: [{ name: 'X', absences: 0 }] }],
      }).success,
    ).toBe(false);
  });
});

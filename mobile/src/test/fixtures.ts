/** Respostas no formato do "Contrato da API" do plano (dados do seed). */

export const API_URL = 'http://localhost:3333/api';

export const loginResponse = {
  accessToken: 'jwt-gustavo',
  guardian: { id: 'g1', firstName: 'Gustavo', lastName: 'da Silva' },
};

export const meResponse = {
  id: 'g1',
  firstName: 'Gustavo',
  lastName: 'da Silva',
  cpf: '***.294.560-**',
  students: [
    {
      id: 's1',
      rm: 12567,
      firstName: 'Rafael',
      lastName: 'da Silva',
      className: '7EF',
      period: 'Matutino',
    },
    {
      id: 's2',
      rm: 12568,
      firstName: 'Marina',
      lastName: 'da Silva',
      className: '3EF',
      period: 'Vespertino',
    },
  ],
};

export const meWithoutStudents = {
  id: 'g9',
  firstName: 'Carlos',
  lastName: 'Sem Aluno',
  cpf: '***.159.265-**',
  students: [],
};

const day = (date: string, subjects: string[] = []) => ({
  date,
  lessons: subjects.map((subject, index) => ({
    startTime: `0${7 + index}:15`.slice(-5),
    endTime: `0${8 + index}:00`.slice(-5),
    subject,
  })),
});

export const agendaResponse = [
  day('2025-03-16'),
  day('2025-03-17', ['Matemática I', 'Língua Inglesa']),
  day('2025-03-18', ['Produção e Interpretação de Textos']),
  day('2025-03-19', ['Ciências']),
  day('2025-03-20', ['História']),
  day('2025-03-21', ['Coding']),
  day('2025-03-22'),
];

export const reportCardsResponse = [
  { year: 2025, className: '7EF' },
  { year: 2024, className: '6EF' },
];

export const reportCard2025 = {
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
      subjects: [{ name: 'Língua Portuguesa', grade: null, absences: null }],
    },
    {
      term: 3,
      subjects: [{ name: 'Língua Portuguesa', grade: null, absences: null }],
    },
  ],
};

export const invalidCredentials = {
  statusCode: 401,
  message: 'Usuário ou senha inválida.',
  error: 'Unauthorized',
};

import { GuardianNotFoundError } from '../errors/guardian-not-found.error';
import { GuardianProfile } from '../repositories/guardian-profiles.repository';
import { InMemoryGuardianProfilesRepository } from '../testing/in-memory-guardian-profiles.repository';
import { GetMeUseCase } from './get-me.use-case';

const rafael = {
  id: 'student-rafael',
  rm: 12567,
  firstName: 'Rafael',
  lastName: 'da Silva',
  className: '7EF',
  period: 'Matutino',
};
const joana = {
  id: 'student-joana',
  rm: 12568,
  firstName: 'Joana',
  lastName: 'da Silva',
  className: '2EM',
  period: 'Tarde',
};

const gustavo: GuardianProfile = {
  id: 'guardian-gustavo',
  firstName: 'Gustavo',
  lastName: 'da Silva',
  cpf: '96929456004',
  // Ordem do vínculo (a do JSON oficial), que não é a alfabética.
  students: [rafael, joana],
};
const carlos: GuardianProfile = {
  id: 'guardian-carlos',
  firstName: 'Carlos',
  lastName: 'Sem Aluno',
  cpf: '31415926590',
  students: [],
};

describe('GetMeUseCase', () => {
  let useCase: GetMeUseCase;

  beforeEach(() => {
    useCase = new GetMeUseCase(
      new InMemoryGuardianProfilesRepository([gustavo, carlos]),
    );
  });

  it('devolve o responsável com o CPF mascarado e os alunos', async () => {
    const me = await useCase.execute({ guardianId: 'guardian-gustavo' });

    expect(me).toEqual({
      id: 'guardian-gustavo',
      firstName: 'Gustavo',
      lastName: 'da Silva',
      cpf: '***.294.560-**',
      students: [rafael, joana],
    });
  });

  it('mantém os alunos na ordem do repositório, sem reordenar por nome', async () => {
    const me = await useCase.execute({ guardianId: 'guardian-gustavo' });

    expect(me.students.map((student) => student.firstName)).toEqual([
      'Rafael',
      'Joana',
    ]);
  });

  it('nunca devolve o CPF completo', async () => {
    const me = await useCase.execute({ guardianId: 'guardian-gustavo' });

    expect(JSON.stringify(me)).not.toContain('96929456004');
  });

  it('não altera a lista do repositório', async () => {
    await useCase.execute({ guardianId: 'guardian-gustavo' });

    expect(gustavo.students.map((student) => student.firstName)).toEqual([
      'Rafael',
      'Joana',
    ]);
  });

  it('devolve students: [] para o responsável sem aluno', async () => {
    const me = await useCase.execute({ guardianId: 'guardian-carlos' });

    expect(me.students).toEqual([]);
    expect(me.cpf).toBe('***.159.265-**');
  });

  it('recusa com GuardianNotFoundError o token de um responsável que não existe mais', async () => {
    await expect(
      useCase.execute({ guardianId: 'guardian-apagado' }),
    ).rejects.toThrow(GuardianNotFoundError);
  });
});

import {
  loginResponse,
  meResponse,
  meWithoutStudents,
} from '../../../test/fixtures';
import {
  CPF_INVALID_MESSAGE,
  loginFormSchema,
  loginResponseSchema,
  meSchema,
} from '../schemas';

describe('loginResponseSchema', () => {
  it('aceita a resposta do contrato', () => {
    expect(loginResponseSchema.parse(loginResponse)).toEqual(loginResponse);
  });

  it('recusa resposta sem token', () => {
    expect(
      loginResponseSchema.safeParse({ guardian: loginResponse.guardian })
        .success,
    ).toBe(false);
    expect(
      loginResponseSchema.safeParse({ ...loginResponse, accessToken: '' })
        .success,
    ).toBe(false);
  });
});

describe('meSchema', () => {
  it('aceita responsável com e sem alunos', () => {
    expect(meSchema.parse(meResponse)).toEqual(meResponse);
    expect(meSchema.parse(meWithoutStudents).students).toEqual([]);
  });

  it('recusa aluno com rm em texto ou sem turma', () => {
    const [student] = meResponse.students;
    expect(
      meSchema.safeParse({
        ...meResponse,
        students: [{ ...student, rm: '12567' }],
      }).success,
    ).toBe(false);
    const withoutClass: Partial<typeof student> = { ...student };
    delete withoutClass.className;
    expect(
      meSchema.safeParse({ ...meResponse, students: [withoutClass] }).success,
    ).toBe(false);
  });

  it('ignora campos extras da API', () => {
    const parsed = meSchema.parse({ ...meResponse, email: 'x@y.z' });
    expect(parsed).not.toHaveProperty('email');
  });
});

describe('loginFormSchema', () => {
  it('aceita CPF válido (com ou sem máscara) e senha preenchida', () => {
    expect(
      loginFormSchema.safeParse({ cpf: '969.294.560-04', password: '1' })
        .success,
    ).toBe(true);
    expect(
      loginFormSchema.safeParse({ cpf: '96929456004', password: '123456' })
        .success,
    ).toBe(true);
  });

  it('recusa CPF com dígito verificador errado com a mensagem da tela', () => {
    const result = loginFormSchema.safeParse({
      cpf: '969.294.560-05',
      password: '123456',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({
      path: ['cpf'],
      message: CPF_INVALID_MESSAGE,
    });
    expect(CPF_INVALID_MESSAGE).toBe('Confira o CPF digitado.');
  });

  it('recusa senha vazia', () => {
    const result = loginFormSchema.safeParse({
      cpf: '969.294.560-04',
      password: '',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['password']);
  });
});

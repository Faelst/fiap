import { JwtService } from '@nestjs/jwt';
import { getRounds, hash } from 'bcryptjs';
import { GuardianCredentials } from '../../guardians/repositories/guardian-credentials.repository';
import { InMemoryGuardianCredentialsRepository } from '../../guardians/testing/in-memory-guardian-credentials.repository';
import {
  BcryptPasswordHasher,
  DUMMY_PASSWORD_HASH,
} from '../services/password-hasher';
import {
  INVALID_CREDENTIALS_MESSAGE,
  InvalidCredentialsError,
} from '../errors/invalid-credentials.error';
import { LoginUseCase } from './login.use-case';

const SECRET = 'segredo-do-spec';
const PASSWORD = '123456';

describe('LoginUseCase', () => {
  let gustavo: GuardianCredentials;
  let hasher: BcryptPasswordHasher;
  let jwt: JwtService;
  let useCase: LoginUseCase;

  beforeAll(async () => {
    gustavo = {
      id: 'guardian-1',
      cpf: '96929456004',
      firstName: 'Gustavo',
      lastName: 'Silva',
      // Custo baixo só para o spec ser rápido.
      passwordHash: await hash(PASSWORD, 4),
    };
  });

  beforeEach(() => {
    hasher = new BcryptPasswordHasher();
    jwt = new JwtService({ secret: SECRET, signOptions: { expiresIn: '7d' } });
    useCase = new LoginUseCase(
      new InMemoryGuardianCredentialsRepository([gustavo]),
      hasher,
      jwt,
    );
  });

  it('devolve o token e o responsável quando CPF e senha conferem', async () => {
    const result = await useCase.execute({
      cpf: '96929456004',
      password: PASSWORD,
    });

    expect(result.guardian).toEqual({
      id: 'guardian-1',
      firstName: 'Gustavo',
      lastName: 'Silva',
    });
    const payload = await jwt.verifyAsync<{ sub: string; exp: number }>(
      result.accessToken,
      { secret: SECRET },
    );
    expect(payload.sub).toBe('guardian-1');
    expect(Object.keys(payload).sort()).toEqual(['exp', 'iat', 'sub']);
  });

  it('não devolve o hash da senha nem o CPF', async () => {
    const result = await useCase.execute({
      cpf: '96929456004',
      password: PASSWORD,
    });

    expect(JSON.stringify(result)).not.toContain(gustavo.passwordHash);
    expect(JSON.stringify(result)).not.toContain('96929456004');
  });

  it('recusa CPF inexistente com InvalidCredentialsError e a mensagem padrão', async () => {
    await expect(
      useCase.execute({ cpf: '50879567007', password: PASSWORD }),
    ).rejects.toThrow(new InvalidCredentialsError());
  });

  it('recusa senha errada com InvalidCredentialsError e a mensagem padrão', async () => {
    await expect(
      useCase.execute({ cpf: '96929456004', password: '654321' }),
    ).rejects.toThrow(new InvalidCredentialsError());
  });

  it('usa a mesma resposta para CPF inexistente e senha errada', async () => {
    const unknownCpf = await useCase
      .execute({ cpf: '50879567007', password: PASSWORD })
      .catch((error: unknown) => error);
    const wrongPassword = await useCase
      .execute({ cpf: '96929456004', password: '654321' })
      .catch((error: unknown) => error);

    expect(unknownCpf).toBeInstanceOf(InvalidCredentialsError);
    expect(wrongPassword).toBeInstanceOf(InvalidCredentialsError);
    expect((unknownCpf as Error).message).toBe(
      (wrongPassword as Error).message,
    );
    expect((unknownCpf as Error).message).toBe(INVALID_CREDENTIALS_MESSAGE);
    expect(INVALID_CREDENTIALS_MESSAGE).toBe('Usuário ou senha inválida.');
  });

  it('compara a senha contra um hash falso quando o CPF não existe (mesmo custo de tempo)', async () => {
    const compare = jest.spyOn(hasher, 'compare');

    await expect(
      useCase.execute({ cpf: '50879567007', password: PASSWORD }),
    ).rejects.toThrow(InvalidCredentialsError);

    expect(compare).toHaveBeenCalledTimes(1);
    expect(compare).toHaveBeenCalledWith(PASSWORD, DUMMY_PASSWORD_HASH);
  });

  it('o hash falso tem o mesmo custo bcrypt do seed (10)', () => {
    expect(getRounds(DUMMY_PASSWORD_HASH)).toBe(10);
  });

  it('não assina token quando a senha está errada', async () => {
    const sign = jest.spyOn(jwt, 'signAsync');

    await expect(
      useCase.execute({ cpf: '96929456004', password: '654321' }),
    ).rejects.toThrow(InvalidCredentialsError);

    expect(sign).not.toHaveBeenCalled();
  });
});

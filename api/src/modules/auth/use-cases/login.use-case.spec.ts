import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRounds, hash } from 'bcryptjs';
import {
  GuardianCredentials,
  GuardiansRepository,
} from '../repositories/guardians.repository';
import {
  BcryptPasswordHasher,
  DUMMY_PASSWORD_HASH,
} from '../services/password-hasher';
import { INVALID_CREDENTIALS_MESSAGE, LoginUseCase } from './login.use-case';

class InMemoryGuardiansRepository implements GuardiansRepository {
  constructor(private readonly guardians: GuardianCredentials[]) {}

  findCredentialsByCpf(cpf: string): Promise<GuardianCredentials | null> {
    return Promise.resolve(
      this.guardians.find((guardian) => guardian.cpf === cpf) ?? null,
    );
  }
}

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
      new InMemoryGuardiansRepository([gustavo]),
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

  it('recusa CPF inexistente com 401 e a mensagem padrão', async () => {
    await expect(
      useCase.execute({ cpf: '50879567007', password: PASSWORD }),
    ).rejects.toThrow(new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE));
  });

  it('recusa senha errada com 401 e a mensagem padrão', async () => {
    await expect(
      useCase.execute({ cpf: '96929456004', password: '654321' }),
    ).rejects.toThrow(new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE));
  });

  it('usa a mesma resposta para CPF inexistente e senha errada', async () => {
    const unknownCpf = await useCase
      .execute({ cpf: '50879567007', password: PASSWORD })
      .catch((error: unknown) => error);
    const wrongPassword = await useCase
      .execute({ cpf: '96929456004', password: '654321' })
      .catch((error: unknown) => error);

    expect(unknownCpf).toBeInstanceOf(UnauthorizedException);
    expect(wrongPassword).toBeInstanceOf(UnauthorizedException);
    expect((unknownCpf as UnauthorizedException).getResponse()).toEqual(
      (wrongPassword as UnauthorizedException).getResponse(),
    );
    expect(INVALID_CREDENTIALS_MESSAGE).toBe('Usuário ou senha inválida.');
  });

  it('compara a senha contra um hash falso quando o CPF não existe (mesmo custo de tempo)', async () => {
    const compare = jest.spyOn(hasher, 'compare');

    await expect(
      useCase.execute({ cpf: '50879567007', password: PASSWORD }),
    ).rejects.toThrow(UnauthorizedException);

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
    ).rejects.toThrow(UnauthorizedException);

    expect(sign).not.toHaveBeenCalled();
  });
});

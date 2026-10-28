import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import {
  GUARDIANS_REPOSITORY,
  type GuardiansRepository,
} from '../repositories/guardians.repository';
import {
  DUMMY_PASSWORD_HASH,
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../services/password-hasher';

export interface LoginInput {
  /** Só dígitos (11). */
  cpf: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  guardian: { id: string; firstName: string; lastName: string };
}

/** Payload do access token. */
export interface AccessTokenPayload {
  sub: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(GUARDIANS_REPOSITORY)
    private readonly guardians: GuardiansRepository,
    @Inject(PASSWORD_HASHER)
    private readonly hasher: PasswordHasher,
    private readonly jwt: JwtService,
  ) {}

  async execute({ cpf, password }: LoginInput): Promise<LoginOutput> {
    const guardian = await this.guardians.findCredentialsByCpf(cpf);

    // Compara sempre, inclusive quando o CPF não existe, para as duas falhas
    // levarem o mesmo tempo e devolverem a mesma mensagem.
    const passwordMatches = await this.hasher.compare(
      password,
      guardian?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );
    if (!guardian || !passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const payload: AccessTokenPayload = { sub: guardian.id };
    return {
      accessToken: await this.jwt.signAsync(payload),
      guardian: {
        id: guardian.id,
        firstName: guardian.firstName,
        lastName: guardian.lastName,
      },
    };
  }
}

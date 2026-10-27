import { Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

export interface PasswordHasher {
  compare(plain: string, hash: string): Promise<boolean>;
}

/**
 * Hash bcrypt de um texto aleatório descartado, com o mesmo custo (10) do seed.
 * O login compara contra ele quando o CPF não existe, para a resposta levar o
 * mesmo tempo de uma senha errada e não revelar quais CPFs estão cadastrados.
 */
export const DUMMY_PASSWORD_HASH =
  '$2b$10$Dcc9nQSION/X4zJhoZEauug9YDHKqxn4Y1c3YyvP4ArNIDY50ivzW';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash);
  }
}

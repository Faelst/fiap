import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Length } from 'class-validator';
import { IsCpf, normalizeCpf } from '../../../shared/decorators/is-cpf';

export const PASSWORD_INVALID_MESSAGE = 'Informe a senha (até 128 caracteres).';

export class LoginDto {
  /** Com ou sem máscara; chega ao use case só com dígitos. */
  @ApiProperty({
    description: 'CPF com dígitos verificadores válidos, com ou sem máscara.',
    example: '969.294.560-04',
  })
  @Transform(({ value }) => normalizeCpf(value))
  @IsCpf()
  cpf!: string;

  // Um só validador (o Length já recusa o que não é texto), para a resposta
  // trazer uma mensagem só. 128 limita o trabalho do bcrypt, que usa 72 bytes.
  @ApiProperty({ minLength: 1, maxLength: 128, example: '123456' })
  @Length(1, 128, { message: PASSWORD_INVALID_MESSAGE })
  password!: string;
}

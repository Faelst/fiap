import { ApiProperty } from '@nestjs/swagger';

/** Corpo de erro padrão do Nest (HttpException). */
export class ErrorResponse {
  @ApiProperty({ example: 401 })
  statusCode!: number;

  @ApiProperty({
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    description: 'Texto, ou lista de textos nos erros de validação (400).',
    example: 'Usuário ou senha inválida.',
  })
  message!: string | string[];

  @ApiProperty({ example: 'Unauthorized', required: false })
  error?: string;
}

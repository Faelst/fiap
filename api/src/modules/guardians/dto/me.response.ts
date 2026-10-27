import { ApiProperty } from '@nestjs/swagger';
import type { GuardianStudentSummary } from '../repositories/guardian-profiles.repository';
import type { GetMeOutput } from '../use-cases/get-me.use-case';

export class GuardianStudentResponse implements GuardianStudentSummary {
  @ApiProperty({
    description: 'Id do aluno, usado nas rotas /students/{id}.',
    example: 'cmhz0student000000000001',
  })
  id!: string;

  @ApiProperty({ example: 12567 })
  rm!: number;

  @ApiProperty({ example: 'Rafael' })
  firstName!: string;

  @ApiProperty({ example: 'da Silva' })
  lastName!: string;

  @ApiProperty({ example: '7EF' })
  className!: string;

  @ApiProperty({ example: 'Matutino' })
  period!: string;
}

export class MeResponse implements GetMeOutput {
  @ApiProperty({ example: 'cmhz0guardian00000000001' })
  id!: string;

  @ApiProperty({ example: 'Gustavo' })
  firstName!: string;

  @ApiProperty({ example: 'da Silva' })
  lastName!: string;

  @ApiProperty({
    description: 'Sempre mascarado: só os 6 dígitos do meio aparecem.',
    example: '***.294.560-**',
  })
  cpf!: string;

  @ApiProperty({
    type: [GuardianStudentResponse],
    description: 'Ordenados pelo nome. Vazio quando não há aluno vinculado.',
  })
  students!: GuardianStudentResponse[];
}

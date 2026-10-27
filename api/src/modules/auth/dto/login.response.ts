import { ApiProperty } from '@nestjs/swagger';
import type { LoginOutput } from '../use-cases/login.use-case';

export class LoginGuardianResponse {
  @ApiProperty({ example: 'cmhz0guardian00000000001' })
  id!: string;

  @ApiProperty({ example: 'Gustavo' })
  firstName!: string;

  @ApiProperty({ example: 'da Silva' })
  lastName!: string;
}

export class LoginResponse implements LoginOutput {
  @ApiProperty({
    description: 'JWT (HS256). Envie como `Authorization: Bearer <token>`.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({ type: LoginGuardianResponse })
  guardian!: LoginGuardianResponse;
}

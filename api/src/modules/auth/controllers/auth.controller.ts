import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../../../shared/decorators/public';
import { ErrorResponse } from '../../../shared/swagger/error-response';
import { LoginDto } from '../dto/login.dto';
import { LoginResponse } from '../dto/login.response';
import { LoginOutput, LoginUseCase } from '../use-cases/login.use-case';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login do responsável com CPF e senha',
    description:
      'Devolve o JWT (validade de JWT_EXPIRES_IN). Rate limit por IP: LOGIN_THROTTLE_LIMIT tentativas por LOGIN_THROTTLE_TTL_MS.',
  })
  @ApiOkResponse({ type: LoginResponse })
  @ApiBadRequestResponse({
    type: ErrorResponse,
    description: 'CPF inválido, senha vazia ou campo a mais no corpo.',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponse,
    description:
      'CPF não cadastrado ou senha errada (mesma mensagem nos dois casos).',
  })
  @ApiTooManyRequestsResponse({
    type: ErrorResponse,
    description: 'Muitas tentativas de login do mesmo IP.',
  })
  login(@Body() body: LoginDto): Promise<LoginOutput> {
    return this.loginUseCase.execute(body);
  }
}

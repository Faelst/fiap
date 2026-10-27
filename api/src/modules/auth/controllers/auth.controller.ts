import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../../../shared/decorators/public';
import { LoginDto } from '../dto/login.dto';
import { LoginOutput, LoginUseCase } from '../use-cases/login.use-case';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('login')
  @HttpCode(200)
  login(@Body() body: LoginDto): Promise<LoginOutput> {
    return this.loginUseCase.execute(body);
  }
}

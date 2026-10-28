import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { EnvironmentVariables } from '../../config/env.validation';
import { GuardiansModule } from '../guardians/guardians.module';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AuthController } from './controllers/auth.controller';
import { JWT_AUDIENCE, JWT_ISSUER } from './jwt.constants';
import {
  BcryptPasswordHasher,
  PASSWORD_HASHER,
} from './services/password-hasher';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LoginUseCase } from './use-cases/login.use-case';

type Config = ConfigService<EnvironmentVariables, true>;

@Module({
  imports: [
    GuardiansModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: Config) => {
        // Formato garantido pelo env.validation (número com unidade, ex.: "7d", "3600s").
        const expiresIn = config.get('JWT_EXPIRES_IN', { infer: true });
        return {
          secret: config.get('JWT_SECRET', { infer: true }),
          signOptions: {
            algorithm: 'HS256',
            expiresIn: expiresIn as JwtSignOptions['expiresIn'],
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
          },
        };
      },
    }),
    // Só o login usa o ThrottlerGuard (no controller), não é guard global.
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: Config) => ({
        throttlers: [
          {
            ttl: config.get('LOGIN_THROTTLE_TTL_MS', { infer: true }),
            limit: config.get('LOGIN_THROTTLE_LIMIT', { infer: true }),
          },
        ],
        errorMessage:
          'Muitas tentativas de login. Aguarde um pouco e tente novamente.',
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    JwtStrategy,
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}

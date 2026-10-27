import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { EnvironmentVariables } from '../../config/env.validation';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AuthController } from './controllers/auth.controller';
import { GUARDIANS_REPOSITORY } from './repositories/guardians.repository';
import { PrismaGuardiansRepository } from './repositories/prisma-guardians.repository';
import {
  BcryptPasswordHasher,
  PASSWORD_HASHER,
} from './services/password-hasher';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LoginUseCase } from './use-cases/login.use-case';

type Config = ConfigService<EnvironmentVariables, true>;

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: Config) => {
        // Formato garantido pelo env.validation (ex.: "7d", "3600").
        const expiresIn = config.get('JWT_EXPIRES_IN', { infer: true });
        return {
          secret: config.get('JWT_SECRET', { infer: true }),
          signOptions: {
            algorithm: 'HS256',
            expiresIn: expiresIn as JwtSignOptions['expiresIn'],
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
    { provide: GUARDIANS_REPOSITORY, useClass: PrismaGuardiansRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}

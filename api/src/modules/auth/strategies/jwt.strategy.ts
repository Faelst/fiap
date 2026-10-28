import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvironmentVariables } from '../../../config/env.validation';
import type { AuthenticatedGuardian } from '../../../shared/decorators/current-guardian';
import { SESSION_INVALID_MESSAGE } from '../../../shared/errors/session-invalid';
import type { AccessTokenPayload } from '../use-cases/login.use-case';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<EnvironmentVariables, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', { infer: true }),
      algorithms: ['HS256'],
    });
  }

  /** O que volta daqui vira `request.user` (lido pelo `@CurrentGuardian()`). */
  validate(payload: Partial<AccessTokenPayload>): AuthenticatedGuardian {
    if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
      throw new UnauthorizedException(SESSION_INVALID_MESSAGE);
    }
    return { id: payload.sub };
  }
}

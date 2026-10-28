import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvironmentVariables } from '../../../config/env.validation';
import type { AuthenticatedGuardian } from '../../../shared/decorators/current-guardian';
import { SESSION_INVALID_MESSAGE } from '../../../shared/errors/session-invalid';
import { JWT_AUDIENCE, JWT_ISSUER } from '../jwt.constants';
import type { AccessTokenPayload } from '../use-cases/login.use-case';

type VerifiedPayload = Partial<AccessTokenPayload> & { exp?: unknown };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<EnvironmentVariables, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', { infer: true }),
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      // Exige `iat` e recusa token mais velho que a validade configurada,
      // mesmo que o `exp` dele seja maior (token assinado à mão).
      jsonWebTokenOptions: {
        maxAge: config.get('JWT_EXPIRES_IN', { infer: true }),
      },
    });
  }

  /** O que volta daqui vira `request.user` (lido pelo `@CurrentGuardian()`). */
  validate(payload: VerifiedPayload): AuthenticatedGuardian {
    // O jsonwebtoken só confere o `exp` quando ele existe: token sem `exp`
    // nunca expiraria.
    if (
      typeof payload.sub !== 'string' ||
      payload.sub.length === 0 ||
      typeof payload.exp !== 'number'
    ) {
      throw new UnauthorizedException(SESSION_INVALID_MESSAGE);
    }
    return { id: payload.sub };
  }
}

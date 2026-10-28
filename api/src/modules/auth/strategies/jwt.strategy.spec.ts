import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const strategy = new JwtStrategy(
    new ConfigService({ JWT_SECRET: 'segredo-do-spec', JWT_EXPIRES_IN: '7d' }),
  );
  const exp = Math.floor(Date.now() / 1000) + 3600;

  it('devolve só o id do responsável a partir do sub', () => {
    expect(strategy.validate({ sub: 'guardian-1', exp })).toEqual({
      id: 'guardian-1',
    });
  });

  it.each([{ exp }, { sub: '', exp }, { sub: 42, exp }])(
    'recusa payload sem sub válido (%p)',
    (payload) => {
      expect(() => strategy.validate(payload as never)).toThrow(
        UnauthorizedException,
      );
    },
  );

  it.each([{ sub: 'guardian-1' }, { sub: 'guardian-1', exp: '9999999999' }])(
    'recusa payload sem exp numérico (%p)',
    (payload) => {
      expect(() => strategy.validate(payload as never)).toThrow(
        UnauthorizedException,
      );
    },
  );
});

import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const strategy = new JwtStrategy(
    new ConfigService({ JWT_SECRET: 'segredo-do-spec' }),
  );

  it('devolve só o id do responsável a partir do sub', () => {
    expect(strategy.validate({ sub: 'guardian-1' })).toEqual({
      id: 'guardian-1',
    });
  });

  it.each([{}, { sub: '' }, { sub: 42 }])(
    'recusa payload sem sub válido (%p)',
    (payload) => {
      expect(() => strategy.validate(payload as never)).toThrow(
        UnauthorizedException,
      );
    },
  );
});

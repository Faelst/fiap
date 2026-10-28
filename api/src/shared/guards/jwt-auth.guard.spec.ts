import { Controller, Get } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../decorators/public';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller()
class MixedController {
  @Public()
  @Get()
  open(this: void): void {}

  @Get()
  closed(this: void): void {}
}

@Public()
@Controller()
class PublicController {
  @Get()
  any(this: void): void {}
}

function contextFor(
  controller: new () => object,
  handler: (...args: unknown[]) => unknown,
): ExecutionContextHost {
  const context = new ExecutionContextHost([{}, {}, () => undefined]);
  context.setType('http');
  jest.spyOn(context, 'getClass').mockReturnValue(controller);
  jest.spyOn(context, 'getHandler').mockReturnValue(handler);
  return context;
}

describe('JwtAuthGuard', () => {
  const passportCanActivate = jest.fn().mockReturnValue('passport');
  let guard: JwtAuthGuard;

  beforeAll(() => {
    jest
      .spyOn(
        AuthGuard('jwt').prototype as { canActivate: () => unknown },
        'canActivate',
      )
      .mockImplementation(passportCanActivate);
  });

  beforeEach(() => {
    passportCanActivate.mockClear();
    guard = new JwtAuthGuard(new Reflector());
  });

  it('libera a rota marcada com @Public() sem validar token', () => {
    const result = guard.canActivate(
      contextFor(MixedController, MixedController.prototype.open),
    );

    expect(result).toBe(true);
    expect(passportCanActivate).not.toHaveBeenCalled();
  });

  it('libera todas as rotas de um controller marcado com @Public()', () => {
    const result = guard.canActivate(
      contextFor(PublicController, PublicController.prototype.any),
    );

    expect(result).toBe(true);
    expect(passportCanActivate).not.toHaveBeenCalled();
  });

  it('exige o token (passport-jwt) nas outras rotas', () => {
    const result = guard.canActivate(
      contextFor(MixedController, MixedController.prototype.closed),
    );

    expect(result).toBe('passport');
    expect(passportCanActivate).toHaveBeenCalledTimes(1);
  });
});

import { LoginFailureLimiter } from './login-failure-limiter';

describe('LoginFailureLimiter', () => {
  let now: number;
  let limiter: LoginFailureLimiter;
  const KEY = 'cpf:96929456004';

  beforeEach(() => {
    now = 1_000_000;
    limiter = new LoginFailureLimiter({ limit: 3, ttlMs: 60_000 }, () => now);
  });

  const fail = (times: number, key = KEY) => {
    for (let i = 0; i < times; i++) limiter.registerFailure(key);
  };

  it('libera quem ainda não falhou', () => {
    expect(limiter.blockedForMs(KEY)).toBe(0);
  });

  it('libera abaixo do limite de falhas', () => {
    fail(2);
    expect(limiter.blockedForMs(KEY)).toBe(0);
  });

  it('bloqueia ao chegar no limite, até o fim da janela', () => {
    fail(3);
    expect(limiter.blockedForMs(KEY)).toBe(60_000);

    now += 45_000;
    expect(limiter.blockedForMs(KEY)).toBe(15_000);
  });

  it('a janela conta da primeira falha e, vencida, libera e recomeça', () => {
    fail(2);
    now += 60_000;
    fail(1);
    expect(limiter.blockedForMs(KEY)).toBe(0);

    fail(2);
    expect(limiter.blockedForMs(KEY)).toBe(60_000);
  });

  it('o sucesso (reset) zera as falhas', () => {
    fail(2);
    limiter.reset(KEY);
    fail(2);
    expect(limiter.blockedForMs(KEY)).toBe(0);
  });

  it('cada CPF tem o seu contador', () => {
    fail(3);
    expect(limiter.blockedForMs('cpf:50879567007')).toBe(0);
  });

  it('não guarda para sempre as chaves vencidas', () => {
    for (let i = 0; i < 50; i++) fail(1, `cpf:${i}`);
    now += 60_000;
    limiter.registerFailure('cpf:novo');

    expect(limiter.size).toBe(1);
  });
});

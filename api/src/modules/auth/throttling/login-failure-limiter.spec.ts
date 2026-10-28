import { LoginFailureLimiter } from './login-failure-limiter';

describe('LoginFailureLimiter', () => {
  let now: number;
  let limiter: LoginFailureLimiter;
  const KEY = 'cpf:96929456004';

  beforeEach(() => {
    now = 1_000_000;
    limiter = new LoginFailureLimiter({ limit: 3, ttlMs: 60_000 }, () => now);
  });

  /** Reserva `times` vagas e devolve o resultado de cada uma. */
  const acquire = (times: number, key = KEY) =>
    Array.from({ length: times }, () => limiter.tryAcquire(key));

  it('libera quem ainda não tentou', () => {
    expect(limiter.blockedForMs(KEY)).toBe(0);
    expect(limiter.tryAcquire(KEY)).toBe(0);
  });

  it('reserva na hora: a tentativa já conta antes de terminar', () => {
    expect(acquire(3)).toEqual([0, 0, 0]);
    // A 4ª é recusada mesmo sem nenhuma das 3 ter terminado (lote paralelo).
    expect(limiter.tryAcquire(KEY)).toBe(60_000);
  });

  it('bloqueado, devolve quanto falta até o fim da janela', () => {
    acquire(3);
    now += 45_000;
    expect(limiter.tryAcquire(KEY)).toBe(15_000);
    expect(limiter.blockedForMs(KEY)).toBe(15_000);
  });

  it('a tentativa recusada não aumenta o contador', () => {
    acquire(6);
    limiter.release(KEY);
    expect(limiter.tryAcquire(KEY)).toBe(0);
  });

  it('release devolve a vaga de uma tentativa que não foi falha de credencial', () => {
    acquire(3);
    limiter.release(KEY);
    expect(limiter.tryAcquire(KEY)).toBe(0);
    expect(limiter.tryAcquire(KEY)).toBeGreaterThan(0);
  });

  it('release sem reserva não deixa o contador negativo', () => {
    limiter.release(KEY);
    limiter.release(KEY);
    expect(acquire(4)).toEqual([0, 0, 0, 60_000]);
  });

  it('o sucesso (reset) zera as falhas', () => {
    acquire(3);
    limiter.reset(KEY);
    expect(acquire(3)).toEqual([0, 0, 0]);
  });

  it('a janela conta da primeira tentativa e, vencida, recomeça', () => {
    acquire(2);
    now += 60_000;
    expect(acquire(3)).toEqual([0, 0, 0]);
    expect(limiter.tryAcquire(KEY)).toBe(60_000);
  });

  it('cada CPF tem o seu contador', () => {
    acquire(3);
    expect(limiter.tryAcquire('cpf:50879567007')).toBe(0);
  });

  it('não guarda para sempre as chaves vencidas', () => {
    for (let i = 0; i < 50; i++) limiter.tryAcquire(`cpf:${i}`);
    now += 60_000;
    limiter.tryAcquire('cpf:novo');

    expect(limiter.size).toBe(1);
  });
});

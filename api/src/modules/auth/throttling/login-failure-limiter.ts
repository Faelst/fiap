export interface LoginFailureLimiterOptions {
  /** Falhas que bloqueiam a chave. */
  limit: number;
  /** Janela, contada da primeira falha. */
  ttlMs: number;
}

interface Entry {
  failures: number;
  windowEndsAt: number;
}

/**
 * Limite de falhas de login por chave (CPF), em memória.
 *
 * A vaga é reservada de forma síncrona, no mesmo tick da checagem
 * (`tryAcquire`), e conta como falha provisória antes de a senha ser
 * conferida. Assim um lote simultâneo não fura o limite enquanto os bcrypts
 * estão em curso. Depois: sucesso → `reset` (zera); falha de credencial → a
 * vaga já está contada; qualquer outro erro → `release` (devolve a vaga).
 * Ao chegar no limite, a chave fica bloqueada até o fim da janela, que conta
 * da primeira tentativa.
 */
export class LoginFailureLimiter {
  private readonly entries = new Map<string, Entry>();
  private lastSweep: number;

  constructor(
    private readonly options: LoginFailureLimiterOptions,
    private readonly now: () => number = Date.now,
  ) {
    this.lastSweep = now();
  }

  /**
   * Reserva uma tentativa. Devolve 0 quando reservou, ou quanto falta do
   * bloqueio em ms (aí nada é contado).
   */
  tryAcquire(key: string): number {
    const blockedMs = this.blockedForMs(key);
    if (blockedMs > 0) {
      return blockedMs;
    }
    const entry = this.current(key);
    if (entry) {
      entry.failures += 1;
    } else {
      this.sweepExpired();
      this.entries.set(key, {
        failures: 1,
        windowEndsAt: this.now() + this.options.ttlMs,
      });
    }
    return 0;
  }

  /** Devolve a vaga de uma tentativa que não terminou em falha de credencial. */
  release(key: string): void {
    const entry = this.current(key);
    if (entry && entry.failures > 0) {
      entry.failures -= 1;
    }
  }

  /** Login certo: zera a chave. */
  reset(key: string): void {
    this.entries.delete(key);
  }

  /** Quanto falta do bloqueio, em ms (0 = liberado). */
  blockedForMs(key: string): number {
    const entry = this.current(key);
    if (!entry || entry.failures < this.options.limit) {
      return 0;
    }
    return entry.windowEndsAt - this.now();
  }

  /** Chaves guardadas (para teste e diagnóstico). */
  get size(): number {
    return this.entries.size;
  }

  private current(key: string): Entry | undefined {
    const entry = this.entries.get(key);
    if (entry && entry.windowEndsAt <= this.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry;
  }

  /** No máximo uma varredura por janela, para a memória não crescer sem fim. */
  private sweepExpired(): void {
    const now = this.now();
    if (now - this.lastSweep < this.options.ttlMs) {
      return;
    }
    this.lastSweep = now;
    for (const [key, entry] of this.entries) {
      if (entry.windowEndsAt <= now) {
        this.entries.delete(key);
      }
    }
  }
}

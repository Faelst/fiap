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
 * Conta só as falhas de login por chave (CPF), em memória. Ao chegar no
 * limite, a chave fica bloqueada até o fim da janela; um login certo zera o
 * contador. Login certo nunca gasta tentativa.
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

  /** Quanto falta do bloqueio, em ms (0 = liberado). */
  blockedForMs(key: string): number {
    const entry = this.current(key);
    if (!entry || entry.failures < this.options.limit) {
      return 0;
    }
    return entry.windowEndsAt - this.now();
  }

  registerFailure(key: string): void {
    const entry = this.current(key);
    if (entry) {
      entry.failures += 1;
      return;
    }
    this.sweepExpired();
    this.entries.set(key, {
      failures: 1,
      windowEndsAt: this.now() + this.options.ttlMs,
    });
  }

  reset(key: string): void {
    this.entries.delete(key);
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

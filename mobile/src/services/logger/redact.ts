export const REDACTED = '[REDACTED]';

/** Chaves que nunca saem no log (comparação sem maiúsculas). */
const SENSITIVE_KEYS = new Set([
  'authorization',
  'password',
  'cpf',
  'accesstoken',
]);

function redactValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (seen.has(value)) {
    return '[Circular]';
  }
  seen.add(value);

  // Erro vira só nome e mensagem: um AxiosError carrega `config.headers`
  // (token) e `config.data` (corpo do login em texto), que a redação por
  // chave não alcança.
  if (value instanceof Error) {
    return { name: value.name, message: value.message };
  }
  if (Array.isArray(value)) {
    return value.map(item => redactValue(item, seen));
  }

  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    result[key] = SENSITIVE_KEYS.has(key.toLowerCase())
      ? REDACTED
      : redactValue(item, seen);
  }
  return result;
}

/** Cópia do valor com token, senha e CPF trocados por `[REDACTED]`. */
export function redact<T>(value: T): T {
  return redactValue(value, new WeakSet()) as T;
}

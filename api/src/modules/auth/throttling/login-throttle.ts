import { isCpf, normalizeCpf } from '../../../shared/decorators/is-cpf';

/**
 * Chave do limite por CPF: `cpf:<11 dígitos>`, ou null quando o corpo não traz
 * um CPF válido (aí vale só o limite por IP). O ThrottlerGuard roda antes do
 * ValidationPipe, então a normalização é feita aqui, com a mesma regra do DTO:
 * com e sem máscara contam juntos.
 */
export function cpfThrottleTracker(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }
  const raw = (body as { cpf?: unknown }).cpf;
  if (typeof raw !== 'string') {
    return null;
  }
  const cpf = normalizeCpf(raw);
  return typeof cpf === 'string' && isCpf(cpf) ? `cpf:${cpf}` : null;
}

/** Mensagem do 429 do login (limite por IP e por CPF). */
export const LOGIN_THROTTLE_MESSAGE =
  'Muitas tentativas de login. Aguarde um pouco e tente novamente.';

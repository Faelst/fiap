import { randomUUID } from 'node:crypto';

export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Só letras e dígitos ASCII, `-`, `_` e `.`, até 64: um id vindo do cliente
 * não pode quebrar a linha do log nem crescer sem limite.
 */
const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{1,64}$/;

/** Reaproveita o `x-request-id` do cliente se for seguro; senão, gera um UUID. */
export function resolveRequestId(
  incoming: string | string[] | undefined,
): string {
  if (typeof incoming === 'string' && SAFE_REQUEST_ID.test(incoming)) {
    return incoming;
  }
  return randomUUID();
}

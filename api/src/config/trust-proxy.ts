import { isIP } from 'node:net';

/** Valor aceito pelo `app.set('trust proxy', ...)` do express. */
export type TrustProxySetting = false | number | string[];

/** Nomes de faixa que o express (proxy-addr) já conhece. */
const NAMED_RANGES = new Set(['loopback', 'linklocal', 'uniquelocal']);

function isAddressOrSubnet(entry: string): boolean {
  if (NAMED_RANGES.has(entry)) {
    return true;
  }
  const [address, prefix, ...rest] = entry.split('/');
  const version = isIP(address);
  if (version === 0 || rest.length > 0) {
    return false;
  }
  if (prefix === undefined) {
    return true;
  }
  const maxPrefix = version === 4 ? 32 : 128;
  return /^\d{1,3}$/.test(prefix) && Number(prefix) <= maxPrefix;
}

/**
 * Lê a env TRUST_PROXY: `false` (padrão), número de saltos ou lista
 * separada por vírgula de IPs, sub-redes (CIDR) e `loopback`, `linklocal`,
 * `uniquelocal`. Valor fora disso lança erro, para o boot falhar cedo em vez
 * de o express quebrar (ou confiar em quem não devia) depois.
 */
export function parseTrustProxy(value: string): TrustProxySetting {
  const normalized = value.trim().toLowerCase();

  if (normalized === '' || normalized === 'false') {
    return false;
  }
  if (normalized === 'true') {
    // Confiar em todo X-Forwarded-For deixa qualquer cliente escolher o próprio
    // IP, e o rate limit por IP deixa de valer.
    throw new Error(
      'TRUST_PROXY inválido ("true"): confiar em qualquer proxy anula o rate limit. Use o número de saltos (ex.: 1) ou a lista de IPs do proxy.',
    );
  }
  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  const entries = normalized
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  const invalid = entries.find((entry) => !isAddressOrSubnet(entry));

  if (entries.length === 0 || invalid !== undefined) {
    throw new Error(
      `TRUST_PROXY inválido ("${invalid ?? value}"): use false, número de saltos ou lista de IPs/sub-redes.`,
    );
  }
  return entries;
}

/**
 * Segredo que está no repositório público (`.env.example`). Serve para subir
 * local sem configurar nada, mas qualquer um consegue assinar token com ele.
 * O Docker não usa segredo fixo: o docker-entrypoint.sh gera um no volume.
 */

/** Valor do `.env.example`. Recusado com NODE_ENV=production. */
export const EXAMPLE_JWT_SECRET =
  'exemplo-local-troque-este-segredo-antes-de-publicar';

export function isRefusedInProduction(secret: string): boolean {
  return secret === EXAMPLE_JWT_SECRET;
}

/** Aviso do boot (fora de produção) com o segredo público; null quando não é. */
export function publicSecretWarning(secret: string): string | null {
  if (secret !== EXAMPLE_JWT_SECRET) {
    return null;
  }
  return 'JWT_SECRET é o valor de exemplo do repositório: qualquer pessoa pode assinar tokens. Use só local; fora daqui gere um com `openssl rand -base64 48`.';
}

/**
 * Segredos que estão no repositório público. Servem para subir local sem
 * configurar nada, mas qualquer um consegue assinar token com eles.
 */

/** Valor do `.env.example`. Recusado com NODE_ENV=production. */
export const EXAMPLE_JWT_SECRET =
  'exemplo-local-troque-este-segredo-antes-de-publicar';

/**
 * Padrão do `docker-compose.yml` (`${JWT_SECRET:-...}`). A imagem roda com
 * NODE_ENV=production, então ele é aceito para o `docker compose up` de um
 * comando funcionar, mas o boot avisa (publicSecretWarning).
 */
export const COMPOSE_JWT_SECRET =
  'docker-compose-local-so-para-avaliacao-troque-em-deploy';

export function isRefusedInProduction(secret: string): boolean {
  return secret === EXAMPLE_JWT_SECRET;
}

/** Aviso do boot quando o segredo é um dos públicos; null quando não é. */
export function publicSecretWarning(secret: string): string | null {
  if (secret !== EXAMPLE_JWT_SECRET && secret !== COMPOSE_JWT_SECRET) {
    return null;
  }
  return 'JWT_SECRET é o valor de exemplo do repositório: qualquer pessoa pode assinar tokens. Use só local; fora daqui gere um com `openssl rand -base64 48`.';
}

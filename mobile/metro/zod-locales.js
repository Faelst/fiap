/**
 * Substitui o `zod/v4/locales/index` no bundle (ver metro.config.js). O zod
 * reexporta as ~40 traduções como `locales`, e o Metro não faz tree-shaking.
 * O app usa só mensagens próprias; o `en` (padrão do zod) segue disponível.
 */
export { default as en } from 'zod/v4/locales/en.js';

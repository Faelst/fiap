import { sizes } from '../theme/sizes';
import { theme } from '../theme/theme';

type LoginLayoutInput = {
  windowHeight: number;
  insetTop: number;
  insetBottom?: number;
};

/**
 * Distância do inset de cima até o topo do logo do Login (01-design.md da
 * v2, 3.2): o bloco de referência (logo + card + ajuda) fica centralizado na
 * área segura, mas nunca a menos de `spacing.section` do topo. Não depende da
 * fonte nem do teclado, então a splash sabe de antemão onde o logo vai parar.
 */
export function loginLogoTop({
  windowHeight,
  insetTop,
  insetBottom = 0,
}: LoginLayoutInput): number {
  const free = windowHeight - insetTop - insetBottom - sizes.loginStackHeight;
  return Math.max(theme.spacing.section, Math.floor(free / 2));
}

/** Centro do logo do Login (245 × 39), contado do topo da janela. */
export function loginLogoCenterY(input: LoginLayoutInput): number {
  return input.insetTop + loginLogoTop(input) + sizes.logoLoginV2.height / 2;
}

/**
 * Quanto o logo da splash, centrado na raiz de altura `rootHeight`, desce
 * (ou sobe) até o centro do logo do Login (3.1).
 */
export function splashToLoginOffsetY({
  rootHeight,
  ...input
}: LoginLayoutInput & { rootHeight: number }): number {
  return loginLogoCenterY(input) - rootHeight / 2;
}

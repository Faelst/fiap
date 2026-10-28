import type { screen } from '@testing-library/react-native';

type Node = ReturnType<typeof screen.getByTestId>;

/**
 * `true` se a view ou algum ancestral dela tem animação de layout de entrada
 * (`entering`). No Android, uma entrada que não termina deixa a view com
 * opacidade 0: ela ocupa o lugar, mas some da tela e da acessibilidade.
 */
export function hasEnteringAncestor(node: Node): boolean {
  let current: Node | null = node;
  while (current) {
    if (current.props.entering !== undefined) return true;
    current = current.parent;
  }
  return false;
}

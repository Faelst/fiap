import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, type Theme } from '../theme';

/**
 * Distância entre o fundo da tab bar flutuante e a borda da tela
 * (01-design.md da v2, 2.4): `s` acima do fim da área segura, e nunca menos
 * que `m`.
 */
export function floatingTabBarBottom(
  insetBottom: number,
  spacing: Pick<Theme['spacing'], 's' | 'm'>,
): number {
  return Math.max(insetBottom - spacing.s, spacing.m);
}

/**
 * Padding de baixo de toda rolagem das abas (V6/N1): o último item para
 * acima da tab bar flutuante, em vez de ficar coberto por ela. Use também
 * em `scrollIndicatorInsets.bottom`.
 */
export function useFloatingTabBarInset(): number {
  const { bottom } = useSafeAreaInsets();
  const { sizes, spacing } = useTheme();
  return (
    sizes.floatingTabBar.height +
    floatingTabBarBottom(bottom, spacing) +
    spacing.m
  );
}

import type { BoxShadowValue } from 'react-native';

import { palette } from './palette';

const glowPrimary = {
  offsetX: 0,
  offsetY: 0,
  blurRadius: 16,
  spreadDistance: 0,
  color: palette.glowTeal,
} as const satisfies BoxShadowValue;

/**
 * Sombras e brilho (01-design.md da v2, 1.6), aplicados com
 * `style={{ boxShadow: [theme.shadows.x] }}` (o Restyle não tem prop de
 * sombra). Sem `elevation`: no preto, só o brilho dá profundidade. Toda
 * superfície com sombra tem também uma borda, a pista que sempre aparece.
 */
export const shadows = {
  /** Aula "Agora", botão primário, campo focado, aluno atual. */
  glowPrimary,
  /** Linha de agora e indicador da tab bar. */
  glowPrimarySoft: { ...glowPrimary, blurRadius: 8 },
  /** Tab bar. */
  floating: {
    offsetX: 0,
    offsetY: 8,
    blurRadius: 24,
    spreadDistance: 0,
    color: palette.shadowBlack,
  },
} as const satisfies Record<string, BoxShadowValue>;

/**
 * Degradês (1.6), desenhados com `react-native-svg` (`LinearGradient` e
 * `RadialGradient`): sem dependência nativa nova.
 */
export const gradients = {
  /** De cima para baixo, atrás da tab bar. */
  tabBarFade: [palette.backgroundClear, palette.black],
  /** Horizontal, a faixa do shimmer do skeleton. */
  shimmer: [palette.backgroundClear, palette.shimmer, palette.backgroundClear],
  /** Halo decorativo atrás do logo do login (`RadialGradient`). */
  loginHalo: { color: palette.teal, centerOpacity: 0.1, edgeOpacity: 0 },
} as const;

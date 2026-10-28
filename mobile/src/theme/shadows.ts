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

/** Parada de degradê: cor opaca + opacidade (vira `stopColor`/`stopOpacity`). */
type GradientStop = { color: string; opacity: number };

/**
 * Degradês (1.6), desenhados com `react-native-svg` (`LinearGradient` e
 * `RadialGradient`): sem dependência nativa nova. O `Stop` do svg ignora o
 * alfa de um `rgba` no `stopColor`, então a transparência vai na opacidade
 * de cada parada.
 */
export const gradients = {
  /** De cima para baixo, atrás da tab bar: do transparente ao fundo. */
  tabBarFade: [
    { color: palette.black, opacity: 0 },
    { color: palette.black, opacity: 1 },
  ],
  /** Horizontal, a faixa do shimmer do skeleton: branco a 7 % no meio. */
  shimmer: [
    { color: palette.white, opacity: 0 },
    { color: palette.white, opacity: 0.07 },
    { color: palette.white, opacity: 0 },
  ],
  /** Halo decorativo atrás do logo do login (`RadialGradient`). */
  loginHalo: { color: palette.teal, centerOpacity: 0.1, edgeOpacity: 0 },
} as const satisfies Record<string, readonly GradientStop[] | object>;

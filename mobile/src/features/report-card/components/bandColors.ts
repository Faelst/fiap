import type { Theme } from '../../../theme';
import type { GradeBand } from '../../../utils/grades';

type Color = keyof Theme['colors'];

/**
 * Cores de cada faixa (01-design.md da v2, 1.2): a do número, da barra e do
 * texto do selo, e o fundo do selo. "Sem nota" usa `textSecondary` no texto:
 * o `textTertiary` sobre `surfaceHigh` dá 4,27 : 1, abaixo do AA (review
 * das fatias 1 e 2).
 */
export const bandColors: Record<GradeBand, { color: Color; muted: Color }> = {
  good: { color: 'primary', muted: 'primaryMuted' },
  warning: { color: 'warning', muted: 'warningMuted' },
  low: { color: 'danger', muted: 'accentMuted' },
  none: { color: 'textSecondary', muted: 'surfaceHigh' },
};

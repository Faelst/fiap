/**
 * Únicos hexadecimais do app (01-design.md, 1.1). Componentes não usam a
 * paleta direto: usam as cores semânticas de `theme.colors`.
 */
export const palette = {
  black: '#000000',
  white: '#FFFFFF',
  teal: '#29F4D5',
  gray900: '#262626',
  gray700: '#4D4D4D',
  // Figma: #525252. Ajustado para 3,1:1 de contraste (01-design.md, 6.2).
  gray600: '#5C5C5C',
  gray500: '#777777',
  gray200: '#CCCCCC',
} as const;

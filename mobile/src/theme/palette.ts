/**
 * Únicos hexadecimais e rgba do app (01-design.md da v2, 1.1). Componentes não
 * usam a paleta direto: usam `theme.colors`, `theme.shadows` e
 * `theme.gradients`.
 */
export const palette = {
  black: '#000000',
  white: '#FFFFFF',
  teal: '#29F4D5',
  /** Superfície afundada (campos, calha do timetable). */
  gray1000: '#0B0B0B',
  /** Superfície 1 (cards). */
  gray950: '#141414',
  /** Superfície 2 (tab bar, blocos de aula, chips). */
  gray900: '#1E1E1E',
  /** Superfície 3 (indicador de segmento, trilho de barra, skeleton). */
  gray850: '#2A2A2A',
  /** Borda forte (decorativa). */
  gray800: '#3A3A3A',
  /** Borda sutil (decorativa). */
  gray750: '#262626',
  /** Borda de campo: ≥ 3 : 1 sobre as superfícies (1.3). */
  gray600: '#6E6E6E',
  gray500: '#808080',
  gray400: '#8C8C8C',
  gray300: '#B3B3B3',
  /** Rosa do selo SCHOOL: só decorativo, nunca recebe texto (4,3 : 1). */
  pink: '#ED145B',
  /** Rosa para texto, barra e borda de erro (AA em todas as superfícies). */
  pinkLight: '#FF5C8D',
  amber: '#FFB547',
  /** Teal a 14 % sobre `gray950`, pré-misturado. */
  tealMuted: '#17332F',
  /** Rosa a 16 % sobre `gray950`. */
  pinkMuted: '#37141F',
  /** Âmbar a 14 % sobre `gray950`. */
  amberMuted: '#352B1B',
  glowTeal: 'rgba(41, 244, 213, 0.35)',
  shadowBlack: 'rgba(0, 0, 0, 0.6)',
} as const;

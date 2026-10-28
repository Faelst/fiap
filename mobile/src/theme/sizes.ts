/** Tamanhos fixos dos componentes (01-design.md, 1.4). */
export const sizes = {
  actionBar: 48,
  dropdown: 45,
  termCard: 90,
  studentCard: 90,
  primaryButton: 60,
  secondaryButton: 45,
  /** Somar `insets.bottom`. */
  tabBar: 64,
  touchTarget: 44,
  icon: 24,
  chevron: 14,
  logoutIcon: 10,
  bullet: 6,
  bulletSlot: 16,
  logoHeader: { width: 100, height: 16 },
  logoLogin: { width: 306, height: 49 },
  illustration: { width: 328, height: 208 },
  /** Barras do skeleton da aula: horário e disciplina (01-design.md, 2.13). */
  skeletonLessonTime: { width: 88, height: 12 },
  skeletonLessonSubject: { width: 180, height: 16 },
  /** Linhas de aula no skeleton da agenda. */
  skeletonLessonRows: 4,
  /** Selo SCHOOL dentro do PNG do logo, em proporção (vale em qualquer tamanho). */
  logoBadge: { x: 0.672, y: 0.35, width: 0.328, height: 0.4 },
  /** Sobra da capa do selo na splash (esconde o antialias da borda). */
  logoBadgeBleed: 1,
  /** Linha teal da splash: largura e quanto passa do logo em cima e embaixo. */
  scanLine: { width: 2, overhang: 8 },
  /** Espessura da linha do input do login. */
  inputLine: 1,
  /** Espessura do trilho de espera da splash. */
  splashTrack: 1,
  /** Teto da fonte grande do sistema em elementos de altura fixa (1.6). */
  fixedHeightFontScale: 1.3,
  contentMaxWidth: 600,
  formMaxWidth: 318,
} as const;

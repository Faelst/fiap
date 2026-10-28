const logoLogin = { width: 306, height: 49 };
const logoLoginV2 = { width: 245, height: 39 };

/** Tamanhos fixos dos componentes (01-design.md da v2, 1.9). */
export const sizes = {
  touchTarget: 44,
  /** Ícones de aba; os de UI usam `iconSmall`. */
  icon: 24,
  /** Ícone do campo, do botão e do chip. */
  iconSmall: 20,
  /** Traço dos ícones novos (casa com o contorno de 1,91 do `AgendaIcon`). */
  iconStroke: 1.9,
  /** Linha do logo + chip do aluno. */
  headerBar: 56,
  /** V7: barra de logo menor (era 100 × 16). */
  logoHeader: { width: 80, height: 13 },
  /** Logo da splash (não muda). */
  logoLogin,
  /** Logo no login: escala 0,8 do da splash. */
  logoLoginV2,
  /** Altura de referência do bloco do login (logo + card + ajuda), para centralizar (3.2). */
  loginStackHeight: 460,
  /** Card do login. */
  formMaxWidth: 400,
  contentMaxWidth: 600,
  studentChip: { height: 40, avatar: 28, maxWidth: 200, chevron: 16 },
  avatar: { s: 28, m: 44, l: 56 },
  textField: 60,
  /** Borda da camada de foco e de erro do campo (2.5). */
  textFieldFocusBorder: 1.5,
  /** `AlertIcon` do erro embaixo do campo. */
  fieldErrorIcon: 16,
  /** Halo radial atrás do logo do login (3.2). */
  loginHalo: 360,
  /** Alturas do `PillButton`. */
  pill: { md: 56, sm: 44, xs: 32 },
  floatingTabBar: {
    height: 64,
    maxWidth: 420,
    indicatorHeight: 48,
    indicatorInset: 6,
  },
  /** Altura do degradê atrás da tab bar. */
  tabBarFade: 96,
  weekChip: { height: 64, dot: 5, gap: 4 },
  segmented: { md: 44, sm: 36, padding: 4 },
  timetable: {
    hour: 80,
    hourCompact: 64,
    gutter: 48,
    minGap: 15,
    maxFontScale: 1.6,
    nowDot: 10,
    nowLine: 2,
    nowLabel: 20,
    autoScrollAnchor: 0.33,
  },
  /** Barra 0–10 e a marca do 7. */
  gradeBar: { card: 6, summary: 8, tick: 1 },
  /**
   * Boletim (2.11–2.16): selo da faixa, pontos da legenda, item do segmento
   * de ano (largura fixa: o indicador desliza entre itens iguais) e os
   * blocos do skeleton.
   */
  reportCard: {
    chip: 24,
    chipDot: 6,
    legendDot: 8,
    yearItem: 112,
    skeletonSummary: 240,
    skeletonSubject: 98,
    skeletonYearWidth: '60%',
  },
  /** Altura mínima do `NowBanner` e do banner de erro do login. */
  banner: 48,
  /** Ícone dos estados vazio e de erro. */
  emptyIcon: { circle: 64, glyph: 28 },
  skeleton: {
    blockHeights: [60, 60, 60, 60],
    subjectCards: 4,
    shimmerWidth: 120,
  },
  /** Perfil (3.5): linha do aluno, linha de sair, rádio e selo "Atual". */
  profile: {
    studentRow: 72,
    logoutRow: 56,
    radio: 22,
    radioBorder: 1.5,
    currentBadge: 28,
    currentBadgeIcon: 16,
  },
  /** Teto da fonte grande do sistema em elementos de altura fixa (1.8). */
  fixedHeightFontScale: 1.3,

  // Splash (fica na v2).
  /** Selo SCHOOL dentro do PNG do logo, em proporção (vale em qualquer tamanho). */
  logoBadge: { x: 0.672, y: 0.35, width: 0.328, height: 0.4 },
  /** Sobra da capa do selo na splash (esconde o antialias da borda). */
  logoBadgeBleed: 1,
  /** Linha teal da splash: largura e quanto passa do logo em cima e embaixo. */
  scanLine: { width: 2, overhang: 8 },
  /** Espessura do trilho de espera da splash. */
  splashTrack: 1,

  // Legado v1: sai na fatia 9, junto com os componentes que usam.
  actionBar: 48,
  dropdown: 45,
  termCard: 90,
  studentCard: 90,
  primaryButton: 60,
  secondaryButton: 45,
  /** Somar `insets.bottom`. */
  tabBar: 64,
  chevron: 14,
  logoutIcon: 10,
  bullet: 6,
  bulletSlot: 16,
  illustration: { width: 328, height: 208 },
  /** Barras do skeleton da aula: horário e disciplina. */
  skeletonLessonTime: { width: 88, height: 12 },
  skeletonLessonSubject: { width: 180, height: 16 },
  /** Linhas de aula no skeleton da agenda. */
  skeletonLessonRows: 4,
  /** Espessura da linha do input do login. */
  inputLine: 1,
  /** Limite de altura do acordeão aberto e parado: "sem limite". */
  accordionOpenMaxHeight: 100_000,
} as const;

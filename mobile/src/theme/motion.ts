import { Easing } from 'react-native-reanimated';

/** Durações e curvas das animações (01-design.md, 1.8). */
export const motion = {
  /** Saída do texto do botão quando vira spinner (01-design.md, 4.2). */
  instant: 100,
  fast: 150,
  base: 220,
  slow: 320,
  stagger: 40,
  easeOut: Easing.out(Easing.cubic),
  easeIn: Easing.in(Easing.cubic),
  press: { damping: 18, stiffness: 260, mass: 1 },
  /** Escala do botão pressionado. */
  pressScale: 0.98,
  /** Deslocamento das entradas `FadeInDown` (campos do login e erro). */
  enterOffset: 12,
  enterOffsetSmall: 8,
  /** Shake do formulário em erro (01-design.md, 4.2): 6 passos de 50 ms. */
  shake: { offsets: [-10, 10, -8, 8, -4, 0], step: 50 },
  /** Shake curto do estado de erro quando o retry falha de novo (4.8). */
  shakeShort: { offsets: [-6, 6, -3, 0], step: 50 },
  /** Seleção de aluno: o modal fecha 120 ms depois da borda acender (4.7). */
  selectStudentBackDelay: 120,
  /** Atraso entre cards da seleção de aluno (4.7). */
  cardStagger: 60,
  /** Ícone da aba que ficou ativa: 1 → 1.12 → 1 (4.4). */
  tabIconPop: 1.12,
  /** Splash animada (01-design.md, 3.1.3 a 3.1.6). */
  splash: {
    minDuration: 1200,
    minDurationReduced: 600,
    loopStartAt: 1500,
    hardTimeout: 10_000,
    meTimeout: 8000,
    wipe: { delay: 80, duration: 600 },
    wipeEasing: Easing.bezier(0.65, 0, 0.35, 1),
    scanFadeIn: 80,
    scanFadeOut: 120,
    scaleFrom: 0.96,
    scaleDuration: 800,
    badgeAt: 620,
    badgeFadeIn: 120,
    badgeScaleFrom: 0.4,
    badgeSpring: { damping: 12, stiffness: 180, mass: 0.8 },
    loopTrack: 1000,
    loopTrackSegment: 0.25,
    badgeBreath: 1600,
    badgeBreathScale: 1.04,
    fadeInReduced: 200,
    exitScaleTo: 0.92,
    exitDuration: 250,
    exitToLoginEasing: Easing.bezier(0.2, 0, 0, 1),
  },
} as const;

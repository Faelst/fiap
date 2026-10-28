import { Easing, FadeInDown, ReduceMotion } from 'react-native-reanimated';

import { sizes } from './sizes';

/** Curva das entradas de card e da saída da splash para o login. */
const emphasized = Easing.bezier(0.2, 0, 0, 1);

/**
 * Durações, curvas e molas (01-design.md da v1, 1.8, com as adições e
 * mudanças da v2, 1.10).
 */
export const motion = {
  /** Saída do texto do botão quando vira spinner (01-design.md, 4.2). */
  instant: 100,
  fast: 150,
  base: 220,
  slow: 320,
  /** Barras de nota enchendo, halo do login. */
  slower: 450,
  stagger: 40,
  /** Saídas curtas: lista do dropdown e troca de dia (01-design.md, 4.5). */
  exitFast: 120,
  /** Teto do stagger: no máximo 6 itens escalonados por lista (1.8). */
  maxStaggered: 6,
  /** Chevron aberto (4.5). */
  chevronOpenDeg: 180,
  /** Shimmer do skeleton: uma passada por `duration`; parado em 0,7 com reduzir movimento. */
  shimmer: { duration: 1200, reducedOpacity: 0.7 },
  /** Relógio da linha de agora. */
  nowTick: 60_000,
  /** Anel do ponto de agora. */
  nowPulse: { duration: 2000, scaleTo: 2.2 },
  /** Escala inicial dos selos. */
  popFrom: 0.9,
  /** Linha do aluno que acabou de ser escolhido no Perfil: 0,98 → 1 (4.6). */
  rowSelectFrom: 0.98,
  /** Logo da splash ao chegar no login (0,8). */
  loginLogoScale: sizes.logoLoginV2.width / sizes.logoLogin.width,
  easeOut: Easing.out(Easing.cubic),
  easeIn: Easing.in(Easing.cubic),
  /** Entradas de card, troca de trimestre e saída da splash para o login. */
  emphasized,
  /** Linha de agora andando. */
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  press: { damping: 18, stiffness: 260, mass: 1 },
  spring: {
    /** Indicadores (tab bar, segmento). */
    snappy: { damping: 22, stiffness: 320, mass: 1 },
    /** Tab bar entrando, card do login. */
    gentle: { damping: 20, stiffness: 170, mass: 1 },
    /** Selo "Agora", selo "Atual", ponto do rádio. */
    pop: { damping: 12, stiffness: 220, mass: 0.8 },
  },
  /** Escala de pílulas, cards e linhas pressionados. */
  pressScale: 0.97,
  /** Escala dos chips de dia e do chip do aluno pressionados. */
  pressScaleSmall: 0.94,
  /** Deslocamento das entradas `FadeInDown` (campos do login e erro). */
  enterOffset: 12,
  enterOffsetSmall: 8,
  /** Card do login e tab bar. */
  enterOffsetCard: 16,
  /** Troca de trimestre ou de ano (direção). */
  slideOffset: 16,
  /** Shake do formulário em erro (01-design.md, 4.2): 6 passos de 50 ms. */
  shake: { offsets: [-10, 10, -8, 8, -4, 0], step: 50 },
  /** Shake curto do estado de erro quando o retry falha de novo (4.8). */
  shakeShort: { offsets: [-6, 6, -3, 0], step: 50 },
  /** Atraso entre cards em cascata. */
  cardStagger: 50,
  /** Atraso entre os 7 chips da faixa semanal (120 ms no total). */
  stripStagger: 20,
  /** Atraso entre os cards de disciplina do Boletim (4.5). */
  subjectStagger: 30,
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
    exitToLoginEasing: emphasized,
  },
  // Legado v1: sai na fatia 9.
  /**
   * Opacidade de ações de texto pressionadas da v1 (barra, dropdown,
   * acordeão). Componente novo usa `opacities.pressed`.
   */
  pressedOpacity: 0.6,
  /** Pulso do skeleton da v1: 0,5 ↔ 1 em 800 ms; parado em 0,7 com reduzir movimento. */
  skeleton: { duration: 800, min: 0.5, reduced: 0.7 },
} as const;

/**
 * Entrada padrão das telas (01-design.md, 4.x): fade de baixo para cima em
 * `base`, `easeOut`, 8 pt, respeitando o reduzir movimento do sistema.
 */
export function enterDown(
  tokens: Pick<typeof motion, 'base' | 'easeOut' | 'enterOffsetSmall'>,
  delay = 0,
) {
  return FadeInDown.duration(tokens.base)
    .delay(delay)
    .easing(tokens.easeOut)
    .withInitialValues({
      transform: [{ translateY: tokens.enterOffsetSmall }],
    })
    .reduceMotion(ReduceMotion.System);
}

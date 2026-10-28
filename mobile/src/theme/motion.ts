import { Easing } from 'react-native-reanimated';

/** Durações e curvas das animações (01-design.md, 1.8). */
export const motion = {
  fast: 150,
  base: 220,
  slow: 320,
  stagger: 40,
  easeOut: Easing.out(Easing.cubic),
  easeIn: Easing.in(Easing.cubic),
  press: { damping: 18, stiffness: 260, mass: 1 },
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

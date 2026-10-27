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
} as const;

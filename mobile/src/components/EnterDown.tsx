import { useEffect, type ReactNode } from 'react';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../theme';

type EnterDownProps = {
  children: ReactNode;
  /** Atraso da entrada (stagger), em ms. */
  delay?: number;
  testID?: string;
};

/**
 * Fade de 8 pt de baixo para cima (`base`, `easeOut`) por valor animado, sem
 * animação de layout. Para o que aparece depois que a tela já montou (erro do
 * campo, banner do login): no Android, a entrada de layout do reanimated às
 * vezes não termina e a view fica montada com opacidade 0 (bug visto na v1,
 * run 40720432602 do Maestro). Com reduzir movimento já monta visível.
 */
export function EnterDown({ children, delay = 0, testID }: EnterDownProps) {
  const { motion } = useTheme();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(reducedMotion ? 1 : 0);
  const offset = motion.enterOffsetSmall;

  useEffect(() => {
    if (reducedMotion) {
      progress.set(1);
      return;
    }
    progress.set(
      withDelay(
        delay,
        withTiming(1, { duration: motion.base, easing: motion.easeOut }),
      ),
    );
  }, [delay, motion, progress, reducedMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: (1 - progress.get()) * offset }],
  }));

  return (
    <Animated.View testID={testID} style={style}>
      {children}
    </Animated.View>
  );
}

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
 * A mesma entrada do `enterDown` (fade de 8 pt abaixo, `base`, `easeOut`),
 * só que com valor animado em vez de animação de layout. Para o que aparece
 * depois que a tela já montou (o dropdown da Agenda e do Boletim, quando os
 * dados chegam): no Android, a entrada de layout dele às vezes não terminava
 * e o dropdown ficava com opacidade 0, ocupando o lugar mas invisível (run
 * 40720432602 do Maestro). Com reduzir movimento já monta visível.
 */
export function EnterDown({ children, delay = 0, testID }: EnterDownProps) {
  const { motion } = useTheme();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(reducedMotion ? 1 : 0);

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
    transform: [
      { translateY: (1 - progress.get()) * motion.enterOffsetSmall },
    ],
  }));

  return (
    <Animated.View testID={testID} style={style}>
      {children}
    </Animated.View>
  );
}

import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type EasingFunction,
  type EasingFunctionFactory,
} from 'react-native-reanimated';

import { useTheme } from '../theme';

type EntranceProps = {
  children: ReactNode;
  /** Atraso da entrada (stagger), em ms. */
  delay?: number;
  /** De onde vem: `x` > 0 entra da direita, `y` > 0 sobe de baixo. */
  offsetX?: number;
  offsetY?: number;
  duration?: number;
  easing?: EasingFunction | EasingFunctionFactory;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Entrada com fade e deslocamento por valor animado, sem animação de layout
 * (`entering`). É para o que monta depois que os dados chegam: no Android do
 * reanimated 4.7.1 a entrada de layout dessas views às vezes não terminava e
 * a view ficava montada com opacidade 0 (Maestro da v1, commit 41cef33).
 * Com reduzir movimento não há deslocamento, só um fade `fast` (opacidade
 * não é movimento, 1.10 regra 4).
 */
export function Entrance({
  children,
  delay = 0,
  offsetX = 0,
  offsetY = 0,
  duration,
  easing,
  style,
  testID,
}: EntranceProps) {
  const { motion } = useTheme();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(
      reducedMotion
        ? withTiming(1, { duration: motion.fast })
        : withDelay(
            delay,
            withTiming(1, {
              duration: duration ?? motion.base,
              easing: easing ?? motion.easeOut,
            }),
          ),
    );
  }, [delay, duration, easing, motion, progress, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    const rest = reducedMotion ? 0 : 1 - progress.get();
    return {
      opacity: progress.get(),
      transform: [
        { translateX: rest * offsetX },
        { translateY: rest * offsetY },
      ],
    };
  });

  return (
    <Animated.View testID={testID} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

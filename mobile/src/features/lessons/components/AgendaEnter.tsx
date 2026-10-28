import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../../theme';

type AgendaEnterProps = {
  children: ReactNode;
  /** Atraso da entrada (cascata), em ms. */
  delay?: number;
  /** Deslocamento inicial em y; 0 = só fade. */
  offset?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Entrada da Agenda (01-design.md da v2, 4.4) por valor animado, sem
 * animação de layout: o que monta depois que os dados chegam (faixa,
 * banner, blocos) não pode usar `entering`, porque no Android a entrada às
 * vezes não termina e a view fica com opacidade 0 (mesmo conserto do
 * `EnterDown` da v1). Com reduzir movimento, só o fade curto (`fast`):
 * opacidade não é movimento.
 */
export function AgendaEnter({
  children,
  delay = 0,
  offset,
  style,
  testID,
}: AgendaEnterProps) {
  const { motion } = useTheme();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const distance = reducedMotion ? 0 : offset ?? motion.enterOffsetSmall;

  useEffect(() => {
    progress.set(
      withDelay(
        reducedMotion ? 0 : delay,
        withTiming(1, {
          duration: reducedMotion ? motion.fast : motion.base,
          easing: motion.easeOut,
        }),
      ),
    );
  }, [delay, motion, progress, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: (1 - progress.get()) * distance }],
  }));

  return (
    <Animated.View testID={testID} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

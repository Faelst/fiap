import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type EasingFunction,
  type EasingFunctionFactory,
  type WithSpringConfig,
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
  /** Escala inicial (o "pop" do ícone e do selo); vai a 1 com `spring`. */
  scaleFrom?: number;
  spring?: WithSpringConfig;
  /** `false`: monta já visível (ex.: o 1º render de um crossfade). */
  enabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * A entrada do app (fade + deslocamento + escala opcional) por valor
 * animado, sem animação de layout (`entering`). É para tudo o que monta
 * depois da tela (dados que chegam, erro de campo, troca de aluno, estados
 * vazio e de erro): no Android do reanimated 4.7.1 a entrada de layout
 * dessas views às vezes não terminava e a view ficava montada com
 * opacidade 0 (Maestro da v1, commit 41cef33). Com reduzir movimento não há
 * deslocamento nem escala, só um fade `fast` sem atraso (opacidade não é
 * movimento, 1.10 regra 4).
 */
export function Entrance({
  children,
  delay = 0,
  offsetX = 0,
  offsetY = 0,
  duration,
  easing,
  scaleFrom,
  spring,
  enabled = true,
  style,
  testID,
}: EntranceProps) {
  const { motion } = useTheme();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(enabled ? 0 : 1);
  const scale = useSharedValue(enabled && scaleFrom != null ? scaleFrom : 1);

  useEffect(() => {
    if (progress.get() === 1) return;
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
    if (scaleFrom != null && !reducedMotion) {
      scale.set(
        withDelay(delay, withSpring(1, spring ?? motion.spring.gentle)),
      );
    } else {
      scale.set(1);
    }
    // Entrada só na montagem: quem quer repetir troca a `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const rest = reducedMotion ? 0 : 1 - progress.get();
    return {
      opacity: progress.get(),
      transform: [
        { translateX: rest * offsetX },
        { translateY: rest * offsetY },
        { scale: scale.get() },
      ],
    };
  });

  return (
    <Animated.View testID={testID} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

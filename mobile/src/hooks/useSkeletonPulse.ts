import { useEffect } from 'react';
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../theme';

/**
 * Pulso do skeleton (01-design.md, 4.8): opacidade 0,5 ↔ 1, um shared value
 * por tela para todos os blocos. Com reduzir movimento fica parado em 0,7.
 * O loop é cancelado ao desmontar.
 */
export function useSkeletonPulse() {
  const { motion } = useTheme();
  const { duration, min, reduced } = motion.skeleton;
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(reducedMotion ? reduced : 1);

  useEffect(() => {
    if (reducedMotion) {
      opacity.set(reduced);
      return;
    }
    opacity.set(
      withRepeat(
        withTiming(min, { duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(opacity);
  }, [reducedMotion, opacity, duration, min, reduced]);

  return useAnimatedStyle(() => ({ opacity: opacity.get() }));
}

import { useEffect } from 'react';
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../theme';

/**
 * Shake horizontal (01-design.md, 4.2). Dispara cada vez que `trigger` muda
 * para um valor maior que zero. Com reduzir movimento não treme: quem avisa
 * do erro é a mensagem.
 */
export function useShakeStyle(trigger: number) {
  const { motion } = useTheme();
  const reducedMotion = useReducedMotion();
  const offsetX = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0 || reducedMotion) return;
    const { offsets, step } = motion.shake;
    offsetX.set(
      withSequence(
        ...offsets.map(offset => withTiming(offset, { duration: step })),
      ),
    );
  }, [trigger, reducedMotion, motion.shake, offsetX]);

  return useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.get() }],
  }));
}

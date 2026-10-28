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
 * Shake horizontal: `form` é o do login (01-design.md, 4.2) e `short` o do
 * estado de erro quando o retry falha de novo (4.8). Dispara cada vez que `trigger` muda
 * para um valor maior que zero. Com reduzir movimento não treme: quem avisa
 * do erro é a mensagem.
 */
export function useShakeStyle(
  trigger: number,
  pattern: 'form' | 'short' = 'form',
) {
  const { motion } = useTheme();
  const shake = pattern === 'short' ? motion.shakeShort : motion.shake;
  const reducedMotion = useReducedMotion();
  const offsetX = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0 || reducedMotion) return;
    const { offsets, step } = shake;
    offsetX.set(
      withSequence(
        ...offsets.map(offset => withTiming(offset, { duration: step })),
      ),
    );
  }, [trigger, reducedMotion, shake, offsetX]);

  return useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.get() }],
  }));
}

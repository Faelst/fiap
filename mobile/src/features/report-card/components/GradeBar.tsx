import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Box, useTheme } from '../../../theme';
import { GRADE_TARGET, type GradeBand } from '../../../utils/grades';
import { bandColors } from './bandColors';

type GradeBarProps = {
  grade: number | null;
  band: GradeBand;
  /** `card` (6) ou `summary` (8). */
  size: 'card' | 'summary';
  /** Atraso do preenchimento: o do card + `fast`. */
  delay?: number;
  testID?: string;
};

const MAX_GRADE = 10;
const TICK_LEFT = `${(GRADE_TARGET / MAX_GRADE) * 100}%` as const;

/**
 * Barra de 0 a 10 (01-design.md da v2, 2.12): trilho `surfaceHigh` e o
 * preenchimento na cor da faixa, que enche da esquerda só com `scaleX`
 * (`slower`, `emphasized`). A marca do 7 fica por cima. Com reduzir
 * movimento já nasce no valor. Decorativa: o card tem o rótulo completo.
 */
export function GradeBar({
  grade,
  band,
  size,
  delay = 0,
  testID,
}: GradeBarProps) {
  const { colors, motion, sizes } = useTheme();
  const reducedMotion = useReducedMotion();
  const target = grade === null ? 0 : grade / MAX_GRADE;
  const fill = useSharedValue(reducedMotion ? target : 0);
  const height = sizes.gradeBar[size];
  const tickOverhang = 2;

  useEffect(() => {
    fill.set(
      reducedMotion
        ? target
        : withDelay(
            delay,
            withTiming(target, {
              duration: motion.slower,
              easing: motion.emphasized,
            }),
          ),
    );
  }, [delay, fill, motion, reducedMotion, target]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: fill.get() }],
  }));

  return (
    <Box
      testID={testID}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      height={height}
      borderRadius="pill"
      backgroundColor="surfaceHigh"
    >
      {grade === null ? null : (
        <Animated.View
          testID={testID ? `${testID}-fill` : undefined}
          style={[
            styles.fill,
            {
              borderRadius: height / 2,
              backgroundColor: colors[bandColors[band].color],
            },
            fillStyle,
          ]}
        />
      )}
      <Box
        position="absolute"
        left={TICK_LEFT}
        top={-tickOverhang}
        width={sizes.gradeBar.tick}
        height={height + 2 * tickOverhang}
        backgroundColor="textTertiary"
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill, transformOrigin: 'left center' },
});

import type { ReactNode } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ReduceMotion,
} from 'react-native-reanimated';

import { Box, Text, useTheme } from '../theme';

const illustrationSource = require('../../assets/no-classroom.png');

type EmptyStateProps = {
  title: string;
  description?: string;
  illustration?: boolean;
  action?: ReactNode;
  testID: string;
};

/**
 * Estado vazio (01-design.md, 2.10): ilustração do "sem aulas" cortada em
 * 328 × 208 (os 82 px de baixo do PNG são o degradê), título e descrição.
 * A ilustração é decorativa.
 */
export function EmptyState({
  title,
  description,
  illustration = true,
  action,
  testID,
}: EmptyStateProps) {
  const { motion, sizes, spacing } = useTheme();
  const enter = (index: number) =>
    FadeInDown.duration(motion.base)
      .delay(index * motion.stagger)
      .easing(motion.easeOut)
      .withInitialValues({
        transform: [{ translateY: motion.enterOffsetSmall }],
      })
      .reduceMotion(ReduceMotion.System);

  return (
    <Box testID={testID} alignItems="center">
      {illustration ? (
        <Animated.View
          entering={FadeIn.duration(motion.base).reduceMotion(
            ReduceMotion.System,
          )}
        >
          <Box
            testID={`${testID}-illustration`}
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            overflow="hidden"
            style={sizes.illustration}
          >
            <Image
              source={illustrationSource}
              style={styles.illustration}
              resizeMode="cover"
            />
          </Box>
        </Animated.View>
      ) : null}
      <Animated.View entering={enter(0)} style={{ marginTop: spacing.m }}>
        <Text variant="emptyState">{title}</Text>
      </Animated.View>
      {description ? (
        <Animated.View
          entering={enter(1)}
          style={{ marginTop: spacing.s, paddingHorizontal: spacing.huge }}
        >
          <Text variant="body" textAlign="center">
            {description}
          </Text>
        </Animated.View>
      ) : null}
      {action ? (
        <Animated.View entering={enter(2)} style={{ marginTop: spacing.l }}>
          {action}
        </Animated.View>
      ) : null}
    </Box>
  );
}

const styles = StyleSheet.create({
  // PNG 328 × 290 alinhado ao topo; a caixa corta o degradê de baixo.
  illustration: { width: '100%', aspectRatio: 328 / 290 },
});

import { Image, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  Keyframe,
  ReduceMotion,
  useReducedMotion,
} from 'react-native-reanimated';

import { Box, enterDown, Text, useTheme, type Theme } from '../theme';

const illustrationSource = require('../../assets/no-classroom.png');

type EmptyStateProps = {
  title: string;
  description?: string;
  illustration?: boolean;
  testID: string;
};

type Motion = Theme['motion'];

/**
 * Entradas do estado vazio (01-design.md, 4.5 e 4.8). A ilustração cresce de
 * 0,96 para 1 enquanto aparece, e o texto vem um stagger depois dela. Com
 * reduzir movimento, tudo só aparece em fade: opacidade não é movimento, então
 * o sistema não pode pular (`ReduceMotion.Never`).
 */
function entrances(motion: Motion, illustration: boolean, reduced: boolean) {
  const first = illustration ? 1 : 0;
  if (reduced) {
    const fade = (delay: number) =>
      FadeIn.duration(motion.base)
        .delay(delay)
        .reduceMotion(ReduceMotion.Never);
    return {
      illustration: fade(0),
      text: (index: number) => fade((first + index) * motion.stagger),
    };
  }
  return {
    illustration: new Keyframe({
      0: {
        opacity: 0,
        transform: [{ scale: motion.illustrationScaleFrom }],
      },
      100: { opacity: 1, transform: [{ scale: 1 }], easing: motion.easeOut },
    })
      .duration(motion.base)
      .reduceMotion(ReduceMotion.System),
    text: (index: number) =>
      enterDown(motion, (first + index) * motion.stagger),
  };
}

/**
 * Estado vazio (01-design.md, 2.10): ilustração do "sem aulas" cortada em
 * 328 × 208 (os 82 px de baixo do PNG são o degradê), título e descrição.
 * A ilustração é decorativa.
 */
export function EmptyState({
  title,
  description,
  illustration = true,
  testID,
}: EmptyStateProps) {
  const { motion, sizes, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const enter = entrances(motion, illustration, reducedMotion);

  return (
    <Box testID={testID} alignItems="center">
      {illustration ? (
        <Animated.View entering={enter.illustration}>
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
      <Animated.View entering={enter.text(0)} style={{ marginTop: spacing.m }}>
        <Text variant="emptyState">{title}</Text>
      </Animated.View>
      {description ? (
        <Animated.View
          entering={enter.text(1)}
          style={{ marginTop: spacing.s, paddingHorizontal: spacing.huge }}
        >
          <Text variant="body" textAlign="center">
            {description}
          </Text>
        </Animated.View>
      ) : null}
    </Box>
  );
}

const styles = StyleSheet.create({
  // PNG 328 × 290 alinhado ao topo; a caixa corta o degradê de baixo.
  illustration: { width: '100%', aspectRatio: 328 / 290 },
});

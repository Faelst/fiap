import type { ComponentType, ReactNode } from 'react';
import Animated, {
  FadeIn,
  Keyframe,
  ReduceMotion,
  useReducedMotion,
} from 'react-native-reanimated';

import { Box, enterDown, Text, useTheme, type Theme } from '../theme';
import type { IconProps } from './icons/StrokeIcon';

type EmptyStateProps = {
  /** Ícone de traço (`components/icons`), desenhado no círculo. */
  icon: ComponentType<IconProps>;
  title: string;
  description?: string;
  /** Ação opcional abaixo do texto (um `PillButton`). */
  action?: ReactNode;
  /** `danger`: círculo `accentMuted` e ícone `danger` (estados de erro). */
  tone?: 'neutral' | 'danger';
  /** Filhos: `X-icon` (o círculo). */
  testID: string;
};

type Motion = Theme['motion'];

/**
 * Entradas (01-design.md da v2, 4.7): o ícone cresce de 0,96 para 1 enquanto
 * aparece e o resto vem em cascata depois dele. Com reduzir movimento, tudo
 * só aparece em fade: opacidade não é movimento, então o sistema não pode
 * pular (`ReduceMotion.Never`).
 */
function entrances(motion: Motion, reduced: boolean) {
  if (reduced) {
    const fade = (delay: number) =>
      FadeIn.duration(motion.base)
        .delay(delay)
        .reduceMotion(ReduceMotion.Never);
    return {
      icon: fade(0),
      item: (index: number) => fade(index * motion.stagger),
    };
  }
  return {
    icon: new Keyframe({
      0: { opacity: 0, transform: [{ scale: motion.illustrationScaleFrom }] },
      100: { opacity: 1, transform: [{ scale: 1 }], easing: motion.easeOut },
    })
      .duration(motion.base)
      .reduceMotion(ReduceMotion.System),
    item: (index: number) => enterDown(motion, index * motion.stagger),
  };
}

/**
 * Estado vazio da v2 (01-design.md da v2, 2.16, DV9): ícone em SVG num
 * círculo (nítido em qualquer densidade, no lugar da ilustração PNG),
 * título, descrição e uma ação opcional, centralizados.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = 'neutral',
  testID,
}: EmptyStateProps) {
  const { colors, motion, sizes, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const enter = entrances(motion, reducedMotion);
  const danger = tone === 'danger';
  // Título é o item 1 da cascata; descrição e ação vêm depois, sem buraco.
  const descriptionIndex = 2;
  const actionIndex = description ? 3 : 2;

  return (
    <Box testID={testID} alignItems="center" paddingVertical="xxxl">
      <Animated.View entering={enter.icon}>
        <Box
          testID={`${testID}-icon`}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          width={sizes.emptyIcon.circle}
          height={sizes.emptyIcon.circle}
          borderRadius="pill"
          alignItems="center"
          justifyContent="center"
          backgroundColor={danger ? 'accentMuted' : 'surfaceRaised'}
        >
          <Icon
            color={danger ? colors.danger : colors.textSecondary}
            size={sizes.emptyIcon.glyph}
          />
        </Box>
      </Animated.View>
      <Animated.View
        entering={enter.item(1)}
        style={{ marginTop: spacing.m, paddingHorizontal: spacing.l }}
      >
        <Text variant="title" textAlign="center">
          {title}
        </Text>
      </Animated.View>
      {description ? (
        <Animated.View
          entering={enter.item(descriptionIndex)}
          style={{ marginTop: spacing.s, paddingHorizontal: spacing.l }}
        >
          <Text
            testID={`${testID}-description`}
            variant="body"
            color="textSecondary"
            textAlign="center"
          >
            {description}
          </Text>
        </Animated.View>
      ) : null}
      {action ? (
        <Animated.View
          entering={enter.item(actionIndex)}
          style={{ marginTop: spacing.l }}
        >
          {action}
        </Animated.View>
      ) : null}
    </Box>
  );
}

import type { ComponentType, ReactNode } from 'react';

import { Box, Text, useTheme } from '../theme';
import { Entrance } from './Entrance';
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

/**
 * Estado vazio da v2 (01-design.md da v2, 2.16 e 4.7, DV9): ícone em SVG num
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
  const step = (index: number) => index * motion.stagger;
  const danger = tone === 'danger';
  // Título é o item 1 da cascata; descrição e ação vêm depois, sem buraco.
  const descriptionIndex = 2;
  const actionIndex = description ? 3 : 2;

  return (
    <Box testID={testID} alignItems="center" paddingVertical="xxxl">
      <Entrance scaleFrom={motion.popFrom} spring={motion.spring.gentle}>
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
      </Entrance>
      <Entrance
        delay={step(1)}
        offsetY={motion.enterOffsetSmall}
        style={{ marginTop: spacing.m, paddingHorizontal: spacing.l }}
      >
        <Text variant="title" textAlign="center">
          {title}
        </Text>
      </Entrance>
      {description ? (
        <Entrance
          delay={step(descriptionIndex)}
          offsetY={motion.enterOffsetSmall}
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
        </Entrance>
      ) : null}
      {action ? (
        <Entrance
          delay={step(actionIndex)}
          offsetY={motion.enterOffsetSmall}
          style={{ marginTop: spacing.l }}
        >
          {action}
        </Entrance>
      ) : null}
    </Box>
  );
}

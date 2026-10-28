import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';

import { strings } from '../constants/strings';
import { useShakeStyle } from '../hooks/useShakeStyle';
import { Box, Text, useTheme } from '../theme';
import { SecondaryButton } from './SecondaryButton';

type ErrorStateProps = {
  title: string;
  description: string;
  onRetry: () => void;
  retrying: boolean;
  testID: string;
  /** Padrão: `${testID}-retry`. */
  retryTestID?: string;
  /** Muda a cada retry que falha: dispara o shake curto (4.8). */
  shakeKey?: number;
};

/**
 * Erro com TENTAR DE NOVO (01-design.md, 2.14): título em `emptyState`,
 * descrição e o botão secundário. Sem ilustração, para não parecer "vazio".
 */
export function ErrorState({
  title,
  description,
  onRetry,
  retrying,
  testID,
  retryTestID,
  shakeKey = 0,
}: ErrorStateProps) {
  const { motion, spacing } = useTheme();
  const shakeStyle = useShakeStyle(shakeKey, 'short');
  const enter = (index: number) =>
    FadeInDown.duration(motion.base)
      .delay(index * motion.stagger)
      .easing(motion.easeOut)
      .withInitialValues({
        transform: [{ translateY: motion.enterOffsetSmall }],
      })
      .reduceMotion(ReduceMotion.System);

  return (
    <Animated.View testID={testID} style={shakeStyle}>
      <Box
        alignItems="center"
        paddingHorizontal="huge"
        style={{ marginTop: spacing.section }}
      >
        <Animated.View entering={enter(0)}>
          <Text variant="emptyState">{title}</Text>
        </Animated.View>
        <Animated.View entering={enter(1)} style={{ marginTop: spacing.s }}>
          <Text variant="body" textAlign="center">
            {description}
          </Text>
        </Animated.View>
        <Animated.View entering={enter(2)} style={{ marginTop: spacing.l }}>
          <SecondaryButton
            testID={retryTestID ?? `${testID}-retry`}
            label={strings.common.retry}
            accessibilityLabel={strings.common.retryAccessibilityLabel}
            loading={retrying}
            onPress={onRetry}
          />
        </Animated.View>
      </Box>
    </Animated.View>
  );
}

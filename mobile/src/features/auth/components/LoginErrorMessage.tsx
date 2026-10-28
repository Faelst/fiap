import { useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  ReduceMotion,
} from 'react-native-reanimated';

import { Text, useTheme } from '../../../theme';

type LoginErrorMessageProps = { message: string };

/**
 * Mensagem de erro do login (01-design.md, 3.2 e 4.2), em `primary`, abaixo
 * da senha. Entra com fade + deslocamento curto e é anunciada uma vez: no
 * Android pela live region, no iOS pelo `announceForAccessibility`.
 */
export function LoginErrorMessage({ message }: LoginErrorMessageProps) {
  const { motion } = useTheme();
  const spoken = message.replace(/\n/g, ' ');

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(spoken);
    }
  }, [spoken]);

  return (
    <Animated.View
      entering={FadeInDown.duration(motion.base)
        .easing(motion.easeOut)
        .withInitialValues({
          transform: [{ translateY: motion.enterOffsetSmall }],
        })
        .reduceMotion(ReduceMotion.System)}
      exiting={FadeOut.duration(motion.fast).reduceMotion(ReduceMotion.System)}
    >
      <Text
        testID="login-error-message"
        variant="error"
        marginTop="xxl"
        accessibilityLabel={spoken}
        accessibilityLiveRegion="polite"
      >
        {message}
      </Text>
    </Animated.View>
  );
}

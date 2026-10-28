import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  ReduceMotion,
} from 'react-native-reanimated';

import { Text, useTheme } from '../../../theme';

type LoginErrorMessageProps = { message: string };

/**
 * Mensagem de erro do login (01-design.md, 3.2 e 4.2), em `primary`, abaixo
 * da senha. Entra com fade + deslocamento curto e é anunciada uma vez pelo
 * `announceForAccessibility` (iOS e Android).
 */
export function LoginErrorMessage({ message }: LoginErrorMessageProps) {
  const { motion } = useTheme();
  const spoken = message.replace(/\n/g, ' ');

  // A live region do Android só avisa mudança numa view que já existia, e a
  // mensagem nasce agora (remonta a cada erro): o anúncio é explícito nas
  // duas plataformas, sem live region para não ler duas vezes.
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(spoken);
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
      >
        {message}
      </Text>
    </Animated.View>
  );
}

import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  ReduceMotion,
  useReducedMotion,
} from 'react-native-reanimated';

import { AlertIcon } from '../../../components/icons/AlertIcon';
import { Box, Text, useTheme } from '../../../theme';

type LoginErrorBannerProps = { message: string };

/**
 * Banner de erro do login (01-design.md da v2, 3.2 e 4.2), acima do botão:
 * erros de envio e o aviso de sessão expirada. Rosa escuro com borda
 * `danger`, ícone de alerta e o texto em `text`. Entra com fade de baixo e é
 * anunciado uma vez ao leitor de tela.
 */
export function LoginErrorBanner({ message }: LoginErrorBannerProps) {
  const { colors, motion, sizes } = useTheme();
  const reducedMotion = useReducedMotion();

  // A live region do Android só avisa mudança numa view que já existia, e o
  // banner nasce agora (remonta a cada erro): o anúncio é explícito nas duas
  // plataformas, sem live region para não ler duas vezes.
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(message);
  }, [message]);

  const entering = reducedMotion
    ? FadeIn.duration(motion.fast).reduceMotion(ReduceMotion.Never)
    : FadeInDown.duration(motion.base)
        .easing(motion.easeOut)
        .withInitialValues({
          transform: [{ translateY: motion.enterOffsetSmall }],
        })
        .reduceMotion(ReduceMotion.System);

  return (
    <Animated.View
      testID="login-error-banner"
      entering={entering}
      exiting={FadeOut.duration(motion.fast).reduceMotion(ReduceMotion.Never)}
    >
      <Box
        testID="login-error-box"
        minHeight={sizes.banner}
        borderRadius="m"
        backgroundColor="accentMuted"
        borderColor="danger"
        borderWidth={1}
        paddingHorizontal="sm"
        paddingVertical="s"
        flexDirection="row"
        alignItems="center"
      >
        <AlertIcon color={colors.danger} />
        <Text
          testID="login-error-message"
          variant="error"
          color="text"
          marginLeft="s"
          flexShrink={1}
          accessibilityLabel={message}
        >
          {message}
        </Text>
      </Box>
    </Animated.View>
  );
}

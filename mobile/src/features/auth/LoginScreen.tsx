import { Image } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ReduceMotion,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../../navigation/types';
import { Box, Text, useTheme } from '../../theme';

const logo = require('../../../assets/logo-fiap-school.png');

/**
 * Placeholder. O Login real (M1, M2) é a Tarefa 9, com o `useLoginViewModel`.
 * O logo já fica onde o design manda (inset de cima + hero, centralizado),
 * porque a splash desliza o logo dela até aqui (01-design.md, 3.1.5). Vindo
 * da splash, o logo não anima no primeiro frame; vindo do logout, entra com
 * fade (4.1).
 */
export function LoginScreen({ route }: RootStackScreenProps<'Login'>) {
  const fromSplash = route.params?.fromSplash === true;
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { motion, sizes, spacing } = useTheme();

  const logoEntering = fromSplash
    ? reducedMotion
      ? // Opacidade não é movimento: o fade acontece mesmo com reduzir movimento.
        FadeIn.duration(motion.fast).reduceMotion(ReduceMotion.Never)
      : undefined
    : FadeIn.duration(motion.base).reduceMotion(ReduceMotion.System);

  return (
    <Box
      testID="login-screen"
      flex={1}
      backgroundColor="background"
      alignItems="center"
      style={{ paddingTop: insets.top + spacing.hero }}
    >
      <Animated.View entering={logoEntering}>
        <Image
          testID="login-logo"
          source={logo}
          accessibilityRole="image"
          accessibilityLabel="FIAP School"
          style={sizes.logoLogin}
        />
      </Animated.View>
      <Animated.View
        entering={FadeInDown.duration(motion.base)
          .easing(motion.easeOut)
          .reduceMotion(ReduceMotion.System)}
      >
        <Box
          alignItems="center"
          paddingHorizontal="huge"
          paddingTop="hero"
          gap="l"
        >
          <Text variant="sectionTitle">Login</Text>
          <Text variant="body" textAlign="center">
            O formulário de CPF e senha entra na Tarefa 9.
          </Text>
        </Box>
      </Animated.View>
    </Box>
  );
}

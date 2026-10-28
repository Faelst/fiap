import { Image, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ReduceMotion,
  SlideInDown,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CpfInput } from '../../components/CpfInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { UnderlineInput } from '../../components/UnderlineInput';
import { strings } from '../../constants/strings';
import { useShakeStyle } from '../../hooks/useShakeStyle';
import type { RootStackScreenProps } from '../../navigation/types';
import { Box, useTheme, type Theme } from '../../theme';
import { LoginErrorMessage } from './components/LoginErrorMessage';
import { useLoginViewModel } from './useLoginViewModel';

const logo = require('../../../assets/logo-fiap-school.png');

type Motion = Theme['motion'];

/**
 * Entradas do Login (01-design.md, 4.1). Vindo da splash, o logo já está no
 * lugar e não anima; campos e botão entram. Com reduzir movimento, só fade
 * (opacidade não é movimento, então o sistema não pode pular). Vindo do
 * logout, tudo entra com fade.
 */
function entrances(motion: Motion, fromSplash: boolean, reduced: boolean) {
  if (fromSplash && reduced) {
    const fade = () =>
      FadeIn.duration(motion.fast).reduceMotion(ReduceMotion.Never);
    return { logo: fade(), field: () => fade(), button: fade() };
  }
  if (fromSplash) {
    return {
      logo: undefined,
      field: (index: number) =>
        FadeInDown.duration(motion.base)
          .delay(index * motion.stagger)
          .easing(motion.easeOut)
          .withInitialValues({
            transform: [{ translateY: motion.enterOffset }],
          })
          .reduceMotion(ReduceMotion.System),
      button: SlideInDown.duration(motion.base)
        .easing(motion.easeOut)
        .reduceMotion(ReduceMotion.System),
    };
  }
  const fade = () =>
    FadeIn.duration(motion.base).reduceMotion(ReduceMotion.System);
  return { logo: fade(), field: () => fade(), button: fade() };
}

/** Login (01-design.md, 3.2): CPF + senha, botão colado na base. */
export function LoginScreen({ route }: RootStackScreenProps<'Login'>) {
  const fromSplash = route.params?.fromSplash === true;
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { motion, sizes, spacing } = useTheme();
  const vm = useLoginViewModel();
  const shakeStyle = useShakeStyle(vm.shakeKey);
  const enter = entrances(motion, fromSplash, reducedMotion);
  const editable = !vm.isSubmitting;

  return (
    <Screen
      testID="login-screen"
      scroll
      keyboard
      footer={
        <Animated.View entering={enter.button}>
          <PrimaryButton
            testID="login-submit-button"
            loadingTestID="login-submit-loading"
            label={strings.login.submit}
            accessibilityLabel={strings.login.submitAccessibilityLabel}
            loadingAccessibilityLabel={
              strings.login.submittingAccessibilityLabel
            }
            disabled={!vm.canSubmit}
            loading={vm.isSubmitting}
            onPress={vm.submit}
            bottomInset={insets.bottom}
          />
        </Animated.View>
      }
    >
      <Box
        testID="login-content"
        alignItems="center"
        style={{ paddingTop: spacing.hero }}
      >
        <Animated.View entering={enter.logo}>
          <Image
            testID="login-logo"
            source={logo}
            accessibilityRole="image"
            accessibilityLabel={strings.common.logoLabel}
            style={sizes.logoLogin}
          />
        </Animated.View>
        <Box
          width="100%"
          paddingHorizontal="huge"
          paddingBottom="xxl"
          alignItems="center"
          style={{ marginTop: spacing.hero }}
        >
          <Animated.View
            style={[styles.form, { maxWidth: sizes.formMaxWidth }, shakeStyle]}
          >
            <Animated.View entering={enter.field(0)}>
              <CpfInput
                testID="login-cpf-input"
                label={strings.login.cpfLabel}
                accessibilityLabel={strings.login.cpfLabel}
                value={vm.cpf.value}
                onChangeText={vm.cpf.onChangeText}
                onBlur={vm.cpf.onBlur}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={vm.focusPassword}
                editable={editable}
              />
            </Animated.View>
            <Animated.View
              entering={enter.field(1)}
              style={{ marginTop: spacing.xxxl }}
            >
              <UnderlineInput
                testID="login-password-input"
                inputRef={vm.passwordRef}
                label={strings.login.passwordLabel}
                accessibilityLabel={strings.login.passwordAccessibilityLabel}
                value={vm.password.value}
                onChangeText={vm.password.onChangeText}
                onBlur={vm.password.onBlur}
                secureTextEntry
                textContentType="password"
                autoComplete="password"
                returnKeyType="go"
                onSubmitEditing={vm.submit}
                editable={editable}
              />
            </Animated.View>
            {vm.errorMessage ? (
              <LoginErrorMessage
                key={vm.errorMessage}
                message={vm.errorMessage}
              />
            ) : null}
          </Animated.View>
        </Box>
      </Box>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { width: '100%' },
});

import {
  Image,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  Keyframe,
  ReduceMotion,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { IdCardIcon } from '../../components/icons/IdCardIcon';
import { LockIcon } from '../../components/icons/LockIcon';
import { PillButton } from '../../components/PillButton';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { strings } from '../../constants/strings';
import { useKeyboardReveal } from '../../hooks/useKeyboardReveal';
import { useShakeStyle } from '../../hooks/useShakeStyle';
import type { RootStackScreenProps } from '../../navigation/types';
import { Box, Card, Text, useTheme, type Theme } from '../../theme';
import { loginLogoTop } from '../../utils/loginLayout';
import { LoginErrorBanner } from './components/LoginErrorBanner';
import { useLoginViewModel } from './useLoginViewModel';

const logo = require('../../../assets/logo-fiap-school.png');

const HALO_GRADIENT_ID = 'login-halo-gradient';

const cpfIcon = (color: string) => <IdCardIcon color={color} />;
const passwordIcon = (color: string) => <LockIcon color={color} />;

type Motion = Theme['motion'];

/**
 * Entradas do Login (01-design.md da v2, 4.2). Vindo da splash, o logo já
 * está no lugar e não anima; o halo acende devagar, o card sobe com uma
 * escala leve e os itens dele entram em cascata. Vindo do logout, o logo
 * também entra em fade. Com reduzir movimento, tudo vira um fade curto que o
 * sistema não pula (opacidade não é movimento).
 */
function entrances(motion: Motion, fromSplash: boolean, reduced: boolean) {
  const fade = (duration: number) =>
    FadeIn.duration(duration).reduceMotion(ReduceMotion.Never);
  const halo = fade(fromSplash ? motion.slower : motion.base).easing(
    motion.easeOut,
  );

  if (reduced) {
    return {
      logo: fade(motion.fast),
      halo,
      card: fade(motion.fast),
      item: () => fade(motion.fast),
      help: fade(motion.fast),
    };
  }
  return {
    logo: fromSplash ? undefined : fade(motion.base),
    halo,
    // O FadeInDown só anima o translateY; a escala leve pede um Keyframe.
    card: new Keyframe({
      from: {
        opacity: 0,
        transform: [
          { translateY: motion.enterOffsetCard },
          { scale: motion.loginCardScaleFrom },
        ],
      },
      to: {
        opacity: 1,
        transform: [{ translateY: 0 }, { scale: 1 }],
        easing: motion.emphasized,
      },
    })
      .duration(motion.slow)
      .reduceMotion(ReduceMotion.System),
    item: (index: number) =>
      FadeInDown.duration(motion.base)
        .delay(motion.loginItemsDelay + index * motion.stagger)
        .easing(motion.easeOut)
        .withInitialValues({
          transform: [{ translateY: motion.enterOffsetSmall }],
        })
        .reduceMotion(ReduceMotion.System),
    help: FadeIn.duration(motion.base)
      .delay(motion.loginHelpDelay)
      .reduceMotion(ReduceMotion.System),
  };
}

/**
 * Login (01-design.md da v2, 3.2): logo no lugar onde a splash o deixa
 * (`utils/loginLayout`), card com os campos, o banner de erro e o botão
 * "Entrar", e a ajuda embaixo. A regra é toda do `useLoginViewModel`.
 */
export function LoginScreen({ route }: RootStackScreenProps<'Login'>) {
  const fromSplash = route.params?.fromSplash === true;
  const reducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width } = useWindowDimensions();
  const { breakpoints, gradients, motion, sizes, spacing } = useTheme();
  const vm = useLoginViewModel();
  const shakeStyle = useShakeStyle(vm.shakeKey);
  const reveal = useKeyboardReveal({
    viewportTop: insets.top,
    margin: spacing.m,
  });
  const enter = entrances(motion, fromSplash, reducedMotion);
  const editable = !vm.isSubmitting;
  const compact = width < breakpoints.phone;
  const tablet = width >= breakpoints.tablet;

  const logoTop = loginLogoTop({
    windowHeight,
    insetTop: insets.top,
    insetBottom: insets.bottom,
  });
  const halo = sizes.loginHalo;
  const logoSize = sizes.logoLoginV2;

  return (
    <Screen testID="login-screen">
      <ScrollView
        testID="login-scroll"
        ref={reveal.scrollRef}
        style={styles.fill}
        contentContainerStyle={styles.grow}
        keyboardShouldPersistTaps="handled"
        // iOS: o sistema abre embaixo o espaço do teclado. Android: o
        // `keyboardInset` do hook entra no padding de baixo.
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        onScroll={reveal.onScroll}
        scrollEventThrottle={16}
      >
        <Box
          testID="login-content"
          alignItems="center"
          paddingHorizontal={compact ? 's' : 'm'}
          style={{
            paddingTop: logoTop,
            paddingBottom: insets.bottom + spacing.l + reveal.keyboardInset,
          }}
        >
          <Box width={logoSize.width} height={logoSize.height}>
            <Animated.View
              testID="login-halo"
              entering={enter.halo}
              pointerEvents="none"
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden
              style={[
                styles.halo,
                {
                  width: halo,
                  height: halo,
                  left: (logoSize.width - halo) / 2,
                  top: (logoSize.height - halo) / 2,
                },
              ]}
            >
              <Svg width="100%" height="100%">
                <Defs>
                  <RadialGradient
                    id={HALO_GRADIENT_ID}
                    cx="50%"
                    cy="50%"
                    r="50%"
                  >
                    <Stop
                      offset="0"
                      stopColor={gradients.loginHalo.color}
                      stopOpacity={gradients.loginHalo.centerOpacity}
                    />
                    <Stop
                      offset="1"
                      stopColor={gradients.loginHalo.color}
                      stopOpacity={gradients.loginHalo.edgeOpacity}
                    />
                  </RadialGradient>
                </Defs>
                <Rect
                  width="100%"
                  height="100%"
                  fill={`url(#${HALO_GRADIENT_ID})`}
                />
              </Svg>
            </Animated.View>
            <Animated.View testID="login-logo-enter" entering={enter.logo}>
              <Image
                testID="login-logo"
                source={logo}
                accessibilityRole="image"
                accessibilityLabel={strings.common.logoLabel}
                style={logoSize}
              />
            </Animated.View>
          </Box>

          <Animated.View
            testID="login-card-enter"
            entering={enter.card}
            onLayout={reveal.onTargetLayout}
            style={[styles.stretch, { marginTop: spacing.xxxl }]}
          >
            <Animated.View style={shakeStyle}>
              <Card
                testID="login-card"
                variant="surface"
                width="100%"
                maxWidth={sizes.formMaxWidth}
                alignSelf="center"
                borderRadius={tablet ? 'xl' : 'l'}
                padding={tablet ? 'xxl' : compact ? 'm' : 'l'}
              >
                <Animated.View testID="login-item-0" entering={enter.item(0)}>
                  <Text variant="title" accessibilityRole="header">
                    {strings.login.title}
                  </Text>
                </Animated.View>
                <Animated.View testID="login-item-1" entering={enter.item(1)}>
                  <Text variant="body" color="textSecondary" marginTop="xs">
                    {strings.login.subtitle}
                  </Text>
                </Animated.View>
                <Animated.View
                  testID="login-item-2"
                  entering={enter.item(2)}
                  style={{ marginTop: spacing.l }}
                >
                  <TextField
                    testID="login-cpf-input"
                    label={strings.login.cpfLabel}
                    icon={cpfIcon}
                    mask="cpf"
                    placeholderWhenFocused={strings.login.cpfPlaceholder}
                    accessibilityHint={strings.login.cpfHint}
                    value={vm.cpf.value}
                    onChangeText={vm.cpf.onChangeText}
                    onBlur={vm.cpf.onBlur}
                    error={vm.cpf.error}
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={vm.focusPassword}
                    editable={editable}
                  />
                </Animated.View>
                <Animated.View
                  testID="login-item-3"
                  entering={enter.item(3)}
                  style={{ marginTop: spacing.sm }}
                >
                  <TextField
                    testID="login-password-input"
                    inputRef={vm.passwordRef}
                    label={strings.login.passwordLabel}
                    icon={passwordIcon}
                    secureToggle
                    value={vm.password.value}
                    onChangeText={vm.password.onChangeText}
                    onFocus={reveal.armed.onFocus}
                    onBlur={() => {
                      reveal.armed.onBlur();
                      vm.password.onBlur();
                    }}
                    textContentType="password"
                    autoComplete="password"
                    returnKeyType="go"
                    onSubmitEditing={vm.submit}
                    editable={editable}
                  />
                </Animated.View>
                {vm.errorMessage ? (
                  <Box marginTop="sm">
                    <LoginErrorBanner
                      key={vm.errorMessage}
                      message={vm.errorMessage}
                    />
                  </Box>
                ) : null}
                <Animated.View
                  testID="login-item-4"
                  entering={enter.item(4)}
                  style={{ marginTop: spacing.l }}
                >
                  <PillButton
                    testID="login-submit-button"
                    label={strings.login.submit}
                    loadingAccessibilityLabel={
                      strings.login.submittingAccessibilityLabel
                    }
                    disabled={!vm.canSubmit}
                    loading={vm.isSubmitting}
                    onPress={vm.submit}
                    fullWidth
                  />
                </Animated.View>
              </Card>
            </Animated.View>
          </Animated.View>

          <Animated.View
            testID="login-help"
            entering={enter.help}
            style={{ maxWidth: sizes.formMaxWidth, marginTop: spacing.l }}
          >
            <Text variant="caption" color="textTertiary" textAlign="center">
              {strings.login.help}
            </Text>
          </Animated.View>
        </Box>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  grow: { flexGrow: 1 },
  stretch: { alignSelf: 'stretch' },
  halo: { position: 'absolute' },
});

import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ButtonContainer, Text, useTheme, type Theme } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'sm' | 'xs';

type PillButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  /** Recebe a cor do ícone (muda com a variante e com o desabilitado). */
  icon?: (color: string) => ReactNode;
  iconPosition?: 'start' | 'end';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  /** Os filhos derivam dele: `X-surface`, `X-label` e `X-loading` (spinner). */
  testID: string;
  /** Padrão: o próprio `label`. */
  accessibilityLabel?: string;
  /** Lido enquanto carrega (ex.: "Entrando…"). */
  loadingAccessibilityLabel?: string;
  accessibilityHint?: string;
};

type Color = keyof Theme['colors'];

/** Cor do texto e do ícone por variante (01-design.md da v2, 2.3). */
const contentColor: Record<Variant, { text: Color; icon: Color }> = {
  primary: { text: 'textOnPrimary', icon: 'textOnPrimary' },
  secondary: { text: 'text', icon: 'primary' },
  ghost: { text: 'primary', icon: 'primary' },
  danger: { text: 'textOnPrimary', icon: 'textOnPrimary' },
};

const horizontalPadding = { md: 'l', sm: 'm', xs: 'sm' } as const;

/**
 * Botão em pílula (01-design.md da v2, 2.3), no lugar do `PrimaryButton` e
 * do `SecondaryButton` da v1. Carregando, o rótulo some (mas fica no layout,
 * então a largura não muda), o spinner aparece e o toque é ignorado. O toque
 * encolhe o botão com mola; o `ghost` também esmaece. Com reduzir movimento,
 * só o esmaecimento fica (opacidade não é movimento).
 */
export function PillButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'start',
  disabled = false,
  loading = false,
  fullWidth = false,
  testID,
  accessibilityLabel,
  loadingAccessibilityLabel,
  accessibilityHint,
}: PillButtonProps) {
  const { colors, motion, opacities, shadows, sizes, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const pressOpacity = useSharedValue(1);
  const inactive = disabled || loading;
  const height = sizes.pill[size];
  // Alvo mínimo de 44: o que falta vira área de toque invisível.
  const slop = Math.max(0, (sizes.touchTarget - height) / 2);
  const textColor =
    colors[disabled ? 'textDisabled' : contentColor[variant].text];
  const iconColor =
    colors[disabled ? 'textDisabled' : contentColor[variant].icon];

  const pressStyle = useAnimatedStyle(() => ({
    opacity: pressOpacity.get(),
    transform: [{ scale: scale.get() }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(loading ? 0 : 1, {
      duration: loading ? motion.instant : motion.fast,
    }),
  }));
  const spinnerStyle = useAnimatedStyle(() => ({
    opacity: withTiming(loading ? 1 : 0, { duration: motion.fast }),
  }));

  const pressIn = () => {
    if (!reducedMotion) scale.set(withSpring(motion.pressScale, motion.press));
    if (variant === 'ghost') {
      pressOpacity.set(
        withTiming(opacities.pressed, { duration: motion.instant }),
      );
    }
  };
  const pressOut = () => {
    if (!reducedMotion) scale.set(withSpring(1, motion.press));
    pressOpacity.set(withTiming(1, { duration: motion.fast }));
  };

  const iconNode = icon ? icon(iconColor) : null;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={
        loading && loadingAccessibilityLabel
          ? loadingAccessibilityLabel
          : accessibilityLabel ?? label
      }
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      hitSlop={{ top: slop, bottom: slop }}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={fullWidth ? styles.fullWidth : styles.hug}
    >
      <Animated.View style={pressStyle}>
        <ButtonContainer
          testID={`${testID}-surface`}
          variant={disabled ? 'disabled' : variant}
          height={height}
          paddingHorizontal={horizontalPadding[size]}
          style={
            variant === 'primary' && !disabled
              ? { boxShadow: [shadows.glowPrimary] }
              : undefined
          }
        >
          <Animated.View
            testID={`${testID}-label`}
            style={[styles.content, { gap: spacing.s }, labelStyle]}
          >
            {iconPosition === 'start' ? iconNode : null}
            <Text
              variant={size === 'md' ? 'button' : 'buttonSmall'}
              color={disabled ? 'textDisabled' : contentColor[variant].text}
              numberOfLines={1}
              maxFontSizeMultiplier={sizes.fixedHeightFontScale}
            >
              {label}
            </Text>
            {iconPosition === 'end' ? iconNode : null}
          </Animated.View>
          {loading ? (
            <Animated.View
              style={[StyleSheet.absoluteFill, styles.center, spinnerStyle]}
            >
              <ActivityIndicator
                testID={`${testID}-loading`}
                size="small"
                color={textColor}
              />
            </Animated.View>
          ) : null}
        </ButtonContainer>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { flexDirection: 'row', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  fullWidth: { alignSelf: 'stretch' },
  hug: { alignSelf: 'center' },
});

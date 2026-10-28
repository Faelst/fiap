import { ActivityIndicator, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ButtonContainer, Text, useTheme } from '../theme';

const AnimatedText = Animated.createAnimatedComponent(Text);

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID: string;
  /** testID do spinner (ex.: `login-submit-loading`). */
  loadingTestID?: string;
  accessibilityLabel: string;
  /** Rótulo lido enquanto carrega (ex.: "Entrando"). */
  loadingAccessibilityLabel?: string;
  /** `insets.bottom`: a área segura de baixo fica na cor do botão. */
  bottomInset?: number;
};

/**
 * Botão principal, largura total e colado na base (01-design.md, 2.7).
 * Desabilitado mantém o fundo `primary` e só o texto fica cinza; carregando
 * troca o texto por um spinner e ignora toques.
 */
export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  testID,
  loadingTestID,
  accessibilityLabel,
  loadingAccessibilityLabel,
  bottomInset = 0,
}: PrimaryButtonProps) {
  const { colors, motion, sizes } = useTheme();
  const scale = useSharedValue(1);
  const inactive = disabled || loading;
  const textColor = disabled ? colors.textDisabled : colors.textOnPrimary;

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    color: withTiming(textColor, { duration: motion.fast }),
  }));

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={
        loading && loadingAccessibilityLabel
          ? loadingAccessibilityLabel
          : accessibilityLabel
      }
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      onPressIn={() => scale.set(withSpring(motion.pressScale, motion.press))}
      onPressOut={() => scale.set(withSpring(1, motion.press))}
      style={{ backgroundColor: colors.primary, paddingBottom: bottomInset }}
    >
      <ButtonContainer variant="primary">
        <Animated.View style={contentStyle}>
          {loading ? (
            <Animated.View
              entering={FadeIn.duration(motion.fast).reduceMotion(
                ReduceMotion.System,
              )}
            >
              <ActivityIndicator
                testID={loadingTestID}
                size="small"
                color={colors.textOnPrimary}
              />
            </Animated.View>
          ) : (
            <AnimatedText
              variant="button"
              maxFontSizeMultiplier={sizes.fixedHeightFontScale}
              style={textStyle}
              exiting={FadeOut.duration(motion.instant).reduceMotion(
                ReduceMotion.System,
              )}
            >
              {label}
            </AnimatedText>
          )}
        </Animated.View>
      </ButtonContainer>
    </Pressable>
  );
}

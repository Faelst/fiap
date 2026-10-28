import {
  createRestyleComponent,
  createVariant,
  type VariantProps,
} from '@shopify/restyle';
import { useEffect, useState, type ReactNode, type Ref } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
} from 'react-native-reanimated';

import { strings } from '../constants/strings';
import { Box, Text, useTheme, type Theme } from '../theme';
import { formatCpf } from '../utils/cpf';
import { Entrance } from './Entrance';
import { AlertIcon } from './icons/AlertIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';

/** TextInput com as `textVariants` do tema. */
const ThemedTextInput = createRestyleComponent<
  VariantProps<Theme, 'textVariants'> &
    TextInputProps & { ref?: Ref<TextInputInstance> },
  Theme
>([createVariant({ themeKey: 'textVariants' })], TextInput);

/** CPF com máscara: `XXX.XXX.XXX-XX`. */
const CPF_MASKED_LENGTH = 14;

export type TextFieldProps = Pick<
  TextInputProps,
  | 'onBlur'
  | 'onFocus'
  | 'keyboardType'
  | 'textContentType'
  | 'autoComplete'
  | 'returnKeyType'
  | 'onSubmitEditing'
  | 'submitBehavior'
  | 'accessibilityHint'
> & {
  label: string;
  /** Recebe a cor do ícone da esquerda. */
  icon: (color: string) => ReactNode;
  value: string;
  onChangeText: (text: string) => void;
  /** Texto do erro do campo: borda `danger`, linha embaixo e dica do leitor. */
  error?: string | null;
  /** Senha: oculta, com o botão de olho para mostrar/ocultar. */
  secureToggle?: boolean;
  mask?: 'cpf';
  /** Placeholder que só aparece com foco e o campo vazio. */
  placeholderWhenFocused?: string;
  inputRef?: Ref<TextInputInstance>;
  editable?: boolean;
  /** Padrão: o próprio `label`. */
  accessibilityLabel?: string;
  /** Vai no `TextInput`; os filhos derivam dele (`X-error`, `X-toggle`...). */
  testID: string;
};

/** Props do `TextInput` que a máscara de CPF fixa (2.5). */
const cpfInputProps = {
  keyboardType: 'number-pad',
  maxLength: CPF_MASKED_LENGTH,
  textContentType: 'username',
  autoComplete: 'username',
} as const;

/**
 * Campo de texto da v2 (01-design.md da v2, 2.5), no lugar do
 * `UnderlineInput` e do `CpfInput`: caixa arredondada com ícone, rótulo
 * flutuante (sobe e encolhe com foco ou valor), camadas de foco e de erro por
 * opacidade (o erro vence o foco), máscara de CPF e olho da senha. Só
 * `transform` e `opacity` animam; a cor muda por crossfade de camadas.
 */
export function TextField({
  label,
  icon,
  value,
  onChangeText,
  onFocus,
  onBlur,
  error,
  secureToggle = false,
  mask,
  placeholderWhenFocused,
  inputRef,
  editable = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
  ...inputProps
}: TextFieldProps) {
  const { borderRadii, colors, motion, opacities, shadows, sizes, spacing } =
    useTheme();
  const reducedMotion = useReducedMotion();
  const [focused, setFocused] = useState(false);
  const [secureHidden, setSecureHidden] = useState(true);
  const raised = focused || value.length > 0;
  const hasError = Boolean(error);

  // Anunciado uma vez quando aparece (6.4); depois fica ligado ao campo pela
  // dica. Explícito nas duas plataformas, como o banner do login.
  useEffect(() => {
    if (error) AccessibilityInfo.announceForAccessibility(error);
  }, [error]);

  /** Posição e escala: direto com reduzir movimento; opacidade sempre anima. */
  const move = (target: number) => {
    'worklet';
    return reducedMotion
      ? target
      : withTiming(target, { duration: motion.base, easing: motion.easeOut });
  };
  const fade = (target: number) => {
    'worklet';
    return withTiming(target, {
      duration: motion.fast,
      reduceMotion: ReduceMotion.Never,
    });
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fade(editable ? 1 : opacities.busy),
  }));
  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: move(raised ? -(spacing.m - spacing.xxs) : 0) },
      { scale: move(raised ? motion.fieldLabelScale : 1) },
    ],
  }));
  const activeLabelStyle = useAnimatedStyle(() => ({
    opacity: fade(focused ? 1 : 0),
  }));
  const focusLayerStyle = useAnimatedStyle(() => ({
    opacity: fade(focused && !hasError ? 1 : 0),
  }));
  const errorLayerStyle = useAnimatedStyle(() => ({
    opacity: fade(hasError ? 1 : 0),
  }));
  // O ícone que entra cresce de 0,85 a 1 (sem escala com reduzir movimento).
  // Calculadas no JS: o worklet só lê números.
  const iconScale = (visible: boolean) =>
    reducedMotion || visible ? 1 : motion.toggleIconFrom;
  const showIconScale = iconScale(secureHidden);
  const hideIconScale = iconScale(!secureHidden);
  const showIconStyle = useAnimatedStyle(() => ({
    opacity: fade(secureHidden ? 1 : 0),
    transform: [{ scale: move(showIconScale) }],
  }));
  const hideIconStyle = useAnimatedStyle(() => ({
    opacity: fade(secureHidden ? 0 : 1),
    transform: [{ scale: move(hideIconScale) }],
  }));

  const layer = {
    ...StyleSheet.absoluteFill,
    // Por cima da borda de 1 da caixa.
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: borderRadii.m,
    borderWidth: sizes.textFieldFocusBorder,
  };

  return (
    <Animated.View testID={`${testID}-container`} style={containerStyle}>
      <Box
        testID={`${testID}-box`}
        height={sizes.textField}
        borderRadius="m"
        backgroundColor="surfaceSunken"
        borderColor="borderInput"
        borderWidth={1}
        flexDirection="row"
        alignItems="center"
        paddingLeft="m"
        paddingRight={secureToggle ? 'none' : 'm'}
      >
        {icon(colors.textSecondary)}
        <Box flex={1} alignSelf="stretch" marginLeft="sm">
          <Animated.View
            testID={`${testID}-label`}
            pointerEvents="none"
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            style={[styles.label, labelStyle]}
          >
            <Box>
              <Text
                variant="inputLabel"
                numberOfLines={1}
                maxFontSizeMultiplier={sizes.fixedHeightFontScale}
              >
                {label}
              </Text>
              <Animated.View
                testID={`${testID}-label-active`}
                style={[StyleSheet.absoluteFill, activeLabelStyle]}
              >
                <Text
                  variant="inputLabel"
                  color="primary"
                  numberOfLines={1}
                  maxFontSizeMultiplier={sizes.fixedHeightFontScale}
                >
                  {label}
                </Text>
              </Animated.View>
            </Box>
          </Animated.View>
          <ThemedTextInput
            ref={inputRef}
            testID={testID}
            variant="input"
            style={[
              styles.input,
              { paddingTop: spacing.m + spacing.xs, paddingBottom: spacing.s },
            ]}
            value={value}
            onChangeText={text =>
              onChangeText(mask === 'cpf' ? formatCpf(text) : text)
            }
            onFocus={event => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={event => {
              setFocused(false);
              onBlur?.(event);
            }}
            editable={editable}
            secureTextEntry={secureToggle ? secureHidden : undefined}
            placeholder={focused && !value ? placeholderWhenFocused : undefined}
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityHint={error ?? accessibilityHint}
            selectionColor={colors.primary}
            cursorColor={colors.primary}
            maxFontSizeMultiplier={sizes.fixedHeightFontScale}
            autoCorrect={false}
            autoCapitalize="none"
            {...(mask === 'cpf' ? cpfInputProps : null)}
            {...inputProps}
          />
        </Box>
        {secureToggle ? (
          <Pressable
            testID={`${testID}-toggle`}
            accessibilityRole="button"
            accessibilityLabel={
              secureHidden
                ? strings.login.showPassword
                : strings.login.hidePassword
            }
            // Trocar o modo não tira o foco do campo (a rolagem do login usa
            // keyboardShouldPersistTaps="handled").
            onPress={() => setSecureHidden(current => !current)}
            style={[
              styles.center,
              { width: sizes.touchTarget, height: sizes.touchTarget },
            ]}
          >
            <Animated.View
              testID={`${testID}-toggle-show`}
              style={[StyleSheet.absoluteFill, styles.center, showIconStyle]}
            >
              <EyeIcon color={colors.textSecondary} />
            </Animated.View>
            <Animated.View
              testID={`${testID}-toggle-hide`}
              style={[StyleSheet.absoluteFill, styles.center, hideIconStyle]}
            >
              <EyeOffIcon color={colors.textSecondary} />
            </Animated.View>
          </Pressable>
        ) : null}
        <Animated.View
          testID={`${testID}-focus-layer`}
          pointerEvents="none"
          style={[
            layer,
            {
              borderColor: colors.primary,
              boxShadow: [shadows.glowPrimary],
            },
            focusLayerStyle,
          ]}
        />
        <Animated.View
          testID={`${testID}-error-layer`}
          pointerEvents="none"
          style={[layer, { borderColor: colors.danger }, errorLayerStyle]}
        />
      </Box>
      {/* Valor animado, não layout animation: nasce depois da tela (2.5). */}
      {error ? (
        <Entrance
          key={error}
          testID={`${testID}-error-enter`}
          offsetY={motion.enterOffsetSmall}
        >
          <Box flexDirection="row" alignItems="center" marginTop="xs">
            <AlertIcon color={colors.danger} size={sizes.fieldErrorIcon} />
            <Text
              testID={`${testID}-error`}
              variant="error"
              marginLeft="xs"
              flexShrink={1}
            >
              {error}
            </Text>
          </Box>
        </Entrance>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    // O rótulo encolhe a partir da borda esquerda, alinhado ao texto (2.5).
    transformOrigin: 'left center',
  },
  input: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
});

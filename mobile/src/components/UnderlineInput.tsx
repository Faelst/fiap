import {
  createRestyleComponent,
  createVariant,
  spacing as spacingRestyle,
  type SpacingProps,
  type VariantProps,
} from '@shopify/restyle';
import { useState, type Ref } from 'react';
import {
  TextInput,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { Box, Text, useTheme, type Theme } from '../theme';

/** TextInput com as `textVariants` e o espaçamento do tema. */
const ThemedTextInput = createRestyleComponent<
  VariantProps<Theme, 'textVariants'> &
    SpacingProps<Theme> &
    TextInputProps & { ref?: Ref<TextInputInstance> },
  Theme
>([createVariant({ themeKey: 'textVariants' }), ...spacingRestyle], TextInput);

export type UnderlineInputProps = Pick<
  TextInputProps,
  | 'value'
  | 'onBlur'
  | 'onFocus'
  | 'secureTextEntry'
  | 'keyboardType'
  | 'textContentType'
  | 'autoComplete'
  | 'returnKeyType'
  | 'onSubmitEditing'
  | 'submitBehavior'
  | 'editable'
  | 'maxLength'
  | 'accessibilityHint'
> & {
  label: string;
  onChangeText: (text: string) => void;
  testID: string;
  /** Rótulo lido pelo leitor de tela (padrão: o próprio `label`). */
  accessibilityLabel?: string;
  inputRef?: Ref<TextInputInstance>;
};

/**
 * Campo do login (01-design.md, 2.6): rótulo centralizado, valor grande e uma
 * linha embaixo. O rótulo fica em negrito com o foco; a linha passa de
 * `inputLine` para `text` quando há valor.
 */
export function UnderlineInput({
  label,
  value,
  onChangeText,
  onBlur,
  onFocus,
  testID,
  accessibilityLabel,
  inputRef,
  ...inputProps
}: UnderlineInputProps) {
  const { colors, motion, sizes, spacing } = useTheme();
  const [focused, setFocused] = useState(false);
  const lineColor = value ? colors.text : colors.inputLine;

  const lineStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(lineColor, { duration: motion.fast }),
  }));

  return (
    <Box width="100%">
      <Text
        variant={focused ? 'labelFocused' : 'labelV1'}
        importantForAccessibility="no"
        accessibilityElementsHidden
      >
        {label}
      </Text>
      <ThemedTextInput
        ref={inputRef}
        testID={testID}
        variant="inputValue"
        marginTop="l"
        padding="none"
        value={value}
        onChangeText={onChangeText}
        onFocus={event => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={event => {
          setFocused(false);
          onBlur?.(event);
        }}
        accessibilityLabel={accessibilityLabel ?? label}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        autoCorrect={false}
        autoCapitalize="none"
        {...inputProps}
      />
      <Animated.View
        testID={`${testID}-line`}
        style={[{ height: sizes.inputLine, marginTop: spacing.s }, lineStyle]}
      />
    </Box>
  );
}

import { ActivityIndicator, Pressable } from 'react-native';

import { Box, ButtonContainer, Text, useTheme } from '../theme';

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  testID: string;
  accessibilityLabel: string;
};

/**
 * Botão com contorno teal (01-design.md, 2.8), usado no TENTAR DE NOVO.
 * Carregando: spinner no lugar do texto, com a largura mantida (o texto fica
 * invisível embaixo).
 */
export function SecondaryButton({
  label,
  onPress,
  loading = false,
  testID,
  accessibilityLabel,
}: SecondaryButtonProps) {
  const { colors, motion, sizes } = useTheme();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: loading, disabled: loading }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? motion.pressedOpacity : 1,
      })}
    >
      <ButtonContainer variant="secondary">
        <Text
          variant="bodyBold"
          color="primary"
          maxFontSizeMultiplier={sizes.fixedHeightFontScale}
          opacity={loading ? 0 : 1}
        >
          {label}
        </Text>
        {loading ? (
          <Box
            position="absolute"
            top={0}
            bottom={0}
            left={0}
            right={0}
            alignItems="center"
            justifyContent="center"
          >
            <ActivityIndicator
              testID={`${testID}-loading`}
              size="small"
              color={colors.primary}
            />
          </Box>
        ) : null}
      </ButtonContainer>
    </Pressable>
  );
}

import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, useTheme } from '../theme';

type ScreenProps = {
  children: ReactNode;
  testID: string;
  scroll?: boolean;
  keyboard?: boolean;
  /**
   * Fica fora da rolagem, colado na base (ex.: o botão do login), e cuida do
   * inset de baixo.
   */
  footer?: ReactNode;
};

/**
 * Base de toda tela (01-design.md, 2.1): fundo `background` na janela
 * inteira, área segura em cima, rolagem e teclado opcionais. No tablet o
 * conteúdo fica numa coluna centralizada.
 */
export function Screen({
  children,
  testID,
  scroll = false,
  keyboard = false,
  footer,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { sizes } = useTheme();
  const insetStyle = { paddingTop: insets.top };
  const column = { width: '100%', maxWidth: sizes.contentMaxWidth } as const;

  const content = scroll ? (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={[styles.grow, insetStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Box flex={1} alignSelf="center" style={column}>
        {children}
      </Box>
    </ScrollView>
  ) : (
    <Box flex={1} alignSelf="center" style={[column, insetStyle]}>
      {children}
    </Box>
  );

  const body = (
    <>
      {content}
      {footer}
    </>
  );

  return (
    <Box testID={testID} flex={1} backgroundColor="background">
      {keyboard ? (
        <KeyboardAvoidingView
          style={styles.fill}
          // `padding` nas duas plataformas: com o edge-to-edge do Android
          // (gradle.properties) o adjustResize não redimensiona a janela, e
          // o RN só informa onde o teclado está.
          behavior="padding"
          // O rodapé pinta o inset de baixo (home indicator no iOS, barra de
          // navegação no Android); com o teclado aberto esse pedaço fica
          // atrás do teclado, não acima dele.
          keyboardVerticalOffset={footer ? -insets.bottom : 0}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  grow: { flexGrow: 1 },
});

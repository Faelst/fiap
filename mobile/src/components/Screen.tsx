import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, useTheme } from '../theme';

type Edge = 'top' | 'bottom';

type ScreenProps = {
  children: ReactNode;
  testID: string;
  /** Lados em que a tela aplica a área segura (padrão: só em cima). */
  edges?: Edge[];
  scroll?: boolean;
  keyboard?: boolean;
  /**
   * Fica fora da rolagem, colado na base (ex.: o botão do login). Quando não
   * há `bottom` em `edges`, é ele quem cuida do inset de baixo.
   */
  footer?: ReactNode;
};

/**
 * Base de toda tela (01-design.md, 2.1): fundo `background` na janela
 * inteira, área segura por `edges`, rolagem e teclado opcionais. No tablet o
 * conteúdo fica numa coluna centralizada.
 */
export function Screen({
  children,
  testID,
  edges = ['top'],
  scroll = false,
  keyboard = false,
  footer,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { sizes } = useTheme();
  const insetStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
  };
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
          // Android: windowSoftInputMode=adjustResize faz o trabalho.
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          // O rodapé pinta o inset de baixo; com o teclado aberto esse
          // pedaço fica atrás do teclado, não acima dele.
          keyboardVerticalOffset={
            footer && !edges.includes('bottom') ? -insets.bottom : 0
          }
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

import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, useTheme } from '../theme';

type ScreenProps = {
  children: ReactNode;
  testID: string;
};

/**
 * Base de toda tela (01-design.md, 2.1): fundo `background` na janela
 * inteira e o conteúdo abaixo da área segura de cima. No tablet o conteúdo
 * fica numa coluna centralizada. Rolagem e teclado são de cada tela (o Login
 * cuida do teclado com `useKeyboardReveal`).
 */
export function Screen({ children, testID }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { sizes } = useTheme();

  return (
    <Box testID={testID} flex={1} backgroundColor="background">
      <Box
        flex={1}
        alignSelf="center"
        width="100%"
        style={{ maxWidth: sizes.contentMaxWidth, paddingTop: insets.top }}
      >
        {children}
      </Box>
    </Box>
  );
}

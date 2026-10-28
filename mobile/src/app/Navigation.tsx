import {
  DarkTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
} from '@react-navigation/native';

import { RootStack } from '../navigation/RootStack';
import { theme } from '../theme';

const navigationTheme: NavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.surface,
  },
};

/**
 * A splash JS é a primeira rota e esconde a nativa (só fundo preto) no
 * primeiro layout; a sessão é lida enquanto ela anima.
 */
export function Navigation() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack />
    </NavigationContainer>
  );
}

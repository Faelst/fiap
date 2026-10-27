import {
  DarkTheme,
  NavigationContainer,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import BootSplash from 'react-native-bootsplash';

import { RootStack } from '../navigation/RootStack';
import { useSessionStore } from '../stores/session.store';
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

const hideSplash = () => {
  BootSplash.hide({ fade: true });
};

export function Navigation() {
  const loading = useSessionStore(state => state.status === 'loading');

  // Enquanto o keychain é lido, a splash nativa continua na tela.
  if (loading) {
    return null;
  }

  return (
    <NavigationContainer theme={navigationTheme} onReady={hideSplash}>
      <RootStack />
    </NavigationContainer>
  );
}

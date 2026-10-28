import { ThemeProvider } from '@shopify/restyle';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useSessionStore } from '../stores/session.store';
import { theme } from '../theme';
import { connectFocusToAppState } from './appFocus';
import { Navigation } from './Navigation';
import { queryClient } from './queryClient';

connectFocusToAppState(AppState);

export function App() {
  const bootstrap = useSessionStore(state => state.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <StatusBar barStyle="light-content" />
          <Navigation />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

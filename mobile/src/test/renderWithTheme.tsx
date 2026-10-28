import { ThemeProvider } from '@shopify/restyle';
import { render } from '@testing-library/react-native';
import type { PropsWithChildren, ReactElement } from 'react';

import { theme } from '../theme';

function ThemeWrapper({ children }: PropsWithChildren) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

/**
 * `render` com o tema do app, para componentes que usam Restyle. O tema é o
 * `wrapper`, então o `rerender` também fica dentro dele.
 */
export const renderWithTheme = (ui: ReactElement) =>
  render(ui, { wrapper: ThemeWrapper });

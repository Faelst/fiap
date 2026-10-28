import { ThemeProvider } from '@shopify/restyle';
import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { theme } from '../theme';

/** `render` com o tema do app, para componentes que usam Restyle. */
export const renderWithTheme = (ui: ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

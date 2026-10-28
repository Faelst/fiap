import { useTheme as useRestyleTheme } from '@shopify/restyle';

import type { Theme } from './theme';

/** `useTheme` do Restyle já tipado com o tema do app. */
export const useTheme = () => useRestyleTheme<Theme>();

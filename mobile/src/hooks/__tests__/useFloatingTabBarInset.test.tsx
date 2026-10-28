import { ThemeProvider } from '@shopify/restyle';
import { renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { theme } from '../../theme';
import {
  floatingTabBarBottom,
  useFloatingTabBarInset,
} from '../useFloatingTabBarInset';

const { sizes, spacing } = theme;

const withBottomInset =
  (bottom: number) =>
  ({ children }: PropsWithChildren) =>
    (
      <ThemeProvider theme={theme}>
        <SafeAreaInsetsContext.Provider
          value={{ top: 0, left: 0, right: 0, bottom }}
        >
          {children}
        </SafeAreaInsetsContext.Provider>
      </ThemeProvider>
    );

describe('floatingTabBarBottom', () => {
  it('sem home indicator, a tab bar flutua a `m` da borda', () => {
    expect(floatingTabBarBottom(0, spacing)).toBe(spacing.m);
  });

  it('com home indicator, fica `s` acima do fim da área segura', () => {
    // 393 × 852: inset 34 → o fundo da barra a 26 da borda (2.4).
    expect(floatingTabBarBottom(34, spacing)).toBe(26);
  });

  it('nunca fica a menos de `m` da borda', () => {
    expect(floatingTabBarBottom(20, spacing)).toBe(spacing.m);
  });
});

describe('useFloatingTabBarInset', () => {
  it('altura da barra + distância da borda + `m` (sem home indicator)', async () => {
    const { result } = await renderHook(() => useFloatingTabBarInset(), {
      wrapper: withBottomInset(0),
    });

    expect(result.current).toBe(
      sizes.floatingTabBar.height + spacing.m + spacing.m,
    );
  });

  it('com home indicator, conta o inset de baixo', async () => {
    const { result } = await renderHook(() => useFloatingTabBarInset(), {
      wrapper: withBottomInset(34),
    });

    expect(result.current).toBe(sizes.floatingTabBar.height + 26 + spacing.m);
  });
});

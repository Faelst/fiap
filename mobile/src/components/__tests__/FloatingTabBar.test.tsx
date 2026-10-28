import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import {
  useReducedMotion,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { FloatingTabBar } from '../FloatingTabBar';

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated/mock');
  return {
    ...actual,
    useReducedMotion: jest.fn(() => false),
    withSpring: jest.fn(actual.withSpring),
    withSequence: jest.fn(actual.withSequence),
  };
});

const { colors, motion, shadows, sizes, spacing } = theme;
const reducedMotionMock = useReducedMotion as jest.Mock;

const routes = [
  { key: 'agenda-1', name: 'Agenda' },
  { key: 'boletim-1', name: 'Boletim' },
  { key: 'perfil-1', name: 'Perfil' },
];

/** Ícone falso que mostra a cor recebida (a camada em que está). */
const icon =
  (name: string) =>
  ({ color, size }: { color: string; size: number }) =>
    <Text>{`${name} ${color} ${size}`}</Text>;

const option = (name: string, testID: string) => ({
  options: {
    title: name,
    tabBarAccessibilityLabel: name,
    tabBarButtonTestID: testID,
    tabBarIcon: icon(name),
  },
});

const navigation = {
  emit: jest.fn(() => ({ defaultPrevented: false })),
  navigate: jest.fn(),
};

function tabBarProps(index: number, bottom = 0) {
  return {
    state: {
      index,
      routes,
      key: 'tabs',
      routeNames: routes.map(route => route.name),
    },
    descriptors: {
      'agenda-1': option('Agenda', 'tab-agenda'),
      'boletim-1': option('Boletim', 'tab-boletim'),
      'perfil-1': option('Perfil', 'tab-perfil'),
    },
    navigation,
    insets: { top: 0, left: 0, right: 0, bottom },
  } as unknown as BottomTabBarProps;
}

const hidden = { includeHiddenElements: true };
const layer = (testID: string) => screen.getByTestId(testID, hidden);

/** O `onLayout` da linha de itens: a largura de cada um sai daqui. */
const layoutItems = async (width: number) =>
  fireEvent(screen.getByTestId('tab-bar-items'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width, height: 62 } },
  });

beforeEach(() => {
  jest.clearAllMocks();
  reducedMotionMock.mockReturnValue(false);
});

describe('FloatingTabBar', () => {
  it('lista de 3 abas com a ativa selecionada e os rótulos', async () => {
    await renderWithTheme(<FloatingTabBar {...tabBarProps(0)} />);

    expect(screen.getByTestId('tab-bar')).toHaveProp(
      'accessibilityRole',
      'tablist',
    );
    for (const [testID, name] of [
      ['tab-agenda', 'Agenda'],
      ['tab-boletim', 'Boletim'],
      ['tab-perfil', 'Perfil'],
    ]) {
      const tab = screen.getByTestId(testID);
      expect(tab).toHaveProp('accessibilityRole', 'tab');
      expect(tab).toHaveAccessibleName(name);
      expect(screen.getAllByText(name, hidden).length).toBeGreaterThan(0);
    }
    expect(screen.getByTestId('tab-agenda')).toBeSelected();
    expect(screen.getByTestId('tab-perfil')).not.toBeSelected();
  });

  it('cápsula flutuante: 64 de altura, raio pill, borda e sombra floating', async () => {
    await renderWithTheme(<FloatingTabBar {...tabBarProps(0)} />);

    expect(screen.getByTestId('tab-bar')).toHaveStyle({
      height: sizes.floatingTabBar.height,
      maxWidth: sizes.floatingTabBar.maxWidth,
      borderRadius: theme.borderRadii.pill,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceRaised,
      boxShadow: [shadows.floating],
    });
    expect(screen.getByTestId('tab-bar-container')).toHaveStyle({
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: spacing.m,
    });
  });

  it('flutua acima da área segura: `m` sem home indicator, inset − `s` com ele', async () => {
    const { rerender } = await renderWithTheme(
      <FloatingTabBar {...tabBarProps(0)} />,
    );
    expect(screen.getByTestId('tab-bar')).toHaveStyle({
      marginBottom: spacing.m,
    });

    await rerender(<FloatingTabBar {...tabBarProps(0, 34)} />);
    expect(screen.getByTestId('tab-bar')).toHaveStyle({ marginBottom: 26 });
  });

  it('degradê atrás da barra, que não pega toque', async () => {
    await renderWithTheme(<FloatingTabBar {...tabBarProps(0)} />);

    const fade = screen.getByTestId('tab-bar-fade', hidden);
    expect(fade).toHaveProp('pointerEvents', 'none');
    expect(fade).toHaveStyle({ height: sizes.tabBarFade });
  });

  it('indicador do tamanho de um item menos o inset, na aba ativa', async () => {
    await renderWithTheme(<FloatingTabBar {...tabBarProps(2)} />);
    await layoutItems(381);

    const indicator = screen.getByTestId('tab-bar-indicator', hidden);
    const { indicatorInset, indicatorHeight } = sizes.floatingTabBar;
    expect(indicator).toHaveStyle({
      width: 127 - 2 * indicatorInset,
      height: indicatorHeight,
      marginLeft: indicatorInset,
      borderRadius: theme.borderRadii.pill,
      backgroundColor: colors.primaryMuted,
      boxShadow: [shadows.glowPrimarySoft],
      transform: [{ translateX: 2 * 127 }],
    });
  });

  it('trocar de aba desliza o indicador com a mola snappy', async () => {
    const { rerender } = await renderWithTheme(
      <FloatingTabBar {...tabBarProps(0)} />,
    );
    await layoutItems(381);

    await rerender(<FloatingTabBar {...tabBarProps(1)} />);

    expect(withSpring).toHaveBeenCalledWith(1, motion.spring.snappy);
  });

  it('a camada primary acende na aba do indicador; a outra fica na textSecondary', async () => {
    await renderWithTheme(<FloatingTabBar {...tabBarProps(2)} />);
    await layoutItems(381);

    expect(layer('tab-perfil-active-layer')).toHaveStyle({ opacity: 1 });
    expect(layer('tab-perfil-inactive-layer')).toHaveStyle({ opacity: 0 });
    expect(layer('tab-agenda-active-layer')).toHaveStyle({ opacity: 0 });
    expect(layer('tab-agenda-inactive-layer')).toHaveStyle({ opacity: 1 });
    expect(
      screen.getByText(`Perfil ${colors.primary} ${sizes.icon}`, hidden),
    ).toBeTruthy();
    expect(
      screen.getByText(`Perfil ${colors.textSecondary} ${sizes.icon}`, hidden),
    ).toBeTruthy();
  });

  it('rótulos com teto de fonte grande (altura fixa)', async () => {
    await renderWithTheme(<FloatingTabBar {...tabBarProps(0)} />);

    for (const label of screen.getAllByText('Boletim', hidden)) {
      expect(label).toHaveProp(
        'maxFontSizeMultiplier',
        sizes.fixedHeightFontScale,
      );
    }
  });

  it('tocar na aba inativa navega; na ativa, não', async () => {
    await renderWithTheme(<FloatingTabBar {...tabBarProps(0)} />);

    await fireEvent.press(screen.getByTestId('tab-agenda'));
    expect(navigation.navigate).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('tab-perfil'));
    expect(navigation.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'perfil-1' }),
    );
    expect(navigation.navigate).toHaveBeenCalledWith('Perfil', undefined);
  });

  it('não navega quando o tabPress foi cancelado', async () => {
    navigation.emit.mockReturnValueOnce({ defaultPrevented: true });
    await renderWithTheme(<FloatingTabBar {...tabBarProps(0)} />);

    await fireEvent.press(screen.getByTestId('tab-boletim'));

    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  describe('pop do ícone', () => {
    it('o ícone que fica ativo faz 1 → tabIconPop → 1; na montagem, não', async () => {
      const { rerender } = await renderWithTheme(
        <FloatingTabBar {...tabBarProps(0)} />,
      );
      expect(withSequence).not.toHaveBeenCalled();

      await rerender(<FloatingTabBar {...tabBarProps(2)} />);

      expect(withSequence).toHaveBeenCalledTimes(1);
    });

    it('com reduzir movimento: sem pop e o indicador vai direto', async () => {
      reducedMotionMock.mockReturnValue(true);
      const { rerender } = await renderWithTheme(
        <FloatingTabBar {...tabBarProps(0)} />,
      );

      await rerender(<FloatingTabBar {...tabBarProps(2)} />);

      expect(withSequence).not.toHaveBeenCalled();
      expect(withSpring).not.toHaveBeenCalled();
    });
  });
});

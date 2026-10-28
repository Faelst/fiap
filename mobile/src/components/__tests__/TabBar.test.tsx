import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { TabBar } from '../TabBar';

const routes = [
  { key: 'agenda-1', name: 'Agenda' },
  { key: 'boletim-1', name: 'Boletim' },
];

function tabBarProps(index: number) {
  const navigation = {
    emit: jest.fn(() => ({ defaultPrevented: false })),
    navigate: jest.fn(),
  };
  const icon = () => null;
  const descriptors = {
    'agenda-1': {
      options: {
        title: 'AGENDA',
        tabBarAccessibilityLabel: 'Agenda',
        tabBarButtonTestID: 'tab-agenda',
        tabBarIcon: icon,
      },
    },
    'boletim-1': {
      options: {
        title: 'BOLETIM',
        tabBarAccessibilityLabel: 'Boletim',
        tabBarButtonTestID: 'tab-boletim',
        tabBarIcon: icon,
      },
    },
  };
  const props = {
    state: { index, routes, key: 'tabs', routeNames: ['Agenda', 'Boletim'] },
    descriptors,
    navigation,
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
  } as unknown as BottomTabBarProps;
  return { props, navigation };
}

describe('TabBar', () => {
  it('lista de abas com a ativa selecionada e os rótulos', async () => {
    const { props } = tabBarProps(0);
    await renderWithTheme(<TabBar {...props} />);

    expect(screen.getByTestId('tab-bar')).toHaveProp(
      'accessibilityRole',
      'tablist',
    );
    const agenda = screen.getByTestId('tab-agenda');
    expect(agenda).toHaveProp('accessibilityRole', 'tab');
    expect(agenda).toBeSelected();
    expect(agenda).toHaveAccessibleName('Agenda');
    expect(screen.getByTestId('tab-boletim')).not.toBeSelected();
    expect(screen.getAllByText('AGENDA').length).toBeGreaterThan(0);
  });

  it('aba ativa mostra a camada primary; a inativa, a camada text', async () => {
    const { props } = tabBarProps(1);
    await renderWithTheme(<TabBar {...props} />);

    expect(screen.getByTestId('tab-boletim-active-layer')).toHaveStyle({
      opacity: 1,
    });
    expect(screen.getByTestId('tab-agenda-active-layer')).toHaveStyle({
      opacity: 0,
    });
    expect(
      screen.getAllByText('BOLETIM').map(node => node.props.style),
    ).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          expect.objectContaining({ color: theme.colors.primary }),
        ]),
      ]),
    );
  });

  it('tocar na aba inativa navega; na ativa, não', async () => {
    const { props, navigation } = tabBarProps(0);
    await renderWithTheme(<TabBar {...props} />);

    await fireEvent.press(screen.getByTestId('tab-agenda'));
    expect(navigation.navigate).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByTestId('tab-boletim'));
    expect(navigation.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabPress', target: 'boletim-1' }),
    );
    expect(navigation.navigate).toHaveBeenCalledWith('Boletim', undefined);
  });

  it('altura da tab bar = tabBar + inset de baixo', async () => {
    const { props } = tabBarProps(0);
    await renderWithTheme(
      <TabBar {...props} insets={{ top: 0, left: 0, right: 0, bottom: 34 }} />,
    );

    expect(screen.getByTestId('tab-bar')).toHaveStyle({
      height: theme.sizes.tabBar + 34,
      paddingBottom: 34,
    });
  });
});

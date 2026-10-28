import { ThemeProvider } from '@shopify/restyle';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import BootSplash from 'react-native-bootsplash';

import type { RootStackScreenProps } from '../../../navigation/types';
import { useBootStore } from '../../../stores/boot.store';
import { useSessionStore } from '../../../stores/session.store';
import { theme } from '../../../theme';
import { splashToLoginOffsetY } from '../../../utils/loginLayout';
import { SplashScreen } from '../SplashScreen';
import * as splashAnimation from '../useSplashAnimation';

type Props = RootStackScreenProps<'Splash'>;

const layout = {
  nativeEvent: { layout: { x: 0, y: 0, width: 414, height: 736 } },
};

const renderSplash = async () => {
  const navigation = { reset: jest.fn() };
  await render(
    <ThemeProvider theme={theme}>
      <SplashScreen
        navigation={navigation as unknown as Props['navigation']}
        route={{ key: 'Splash-1', name: 'Splash' } as Props['route']}
      />
    </ThemeProvider>,
  );
  return navigation;
};

describe('SplashScreen', () => {
  beforeEach(() => {
    // O `scheduleOnRN` do mock dos worklets usa queueMicrotask.
    jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });
    (BootSplash.hide as jest.Mock).mockClear();
    useSessionStore.setState({ status: 'signedOut' });
    useBootStore.setState({ splashDone: false });
  });

  afterEach(() => jest.useRealTimers());

  it('desenha a raiz, o logo e o trilho com os rótulos de acessibilidade', async () => {
    await renderSplash();

    expect(screen.getByTestId('splash-screen')).toHaveProp(
      'accessibilityLabel',
      'FIAP School',
    );
    const logo = screen.getByTestId('splash-logo');
    expect(logo).toHaveProp('accessibilityRole', 'image');
    expect(logo).toHaveProp('accessibilityLabel', 'FIAP School');
    // Um elemento só para o leitor: as camadas internas não aparecem.
    expect(logo).toHaveProp('accessible', true);
    const loading = screen.getByTestId('splash-loading', {
      includeHiddenElements: true,
    });
    expect(loading).toHaveProp('accessibilityRole', 'progressbar');
    expect(loading).toHaveProp('accessibilityLabel', 'Carregando');
  });

  it('o trilho só fica acessível a partir de 1500 ms, enquanto espera', async () => {
    useSessionStore.setState({ status: 'loading' });
    await renderSplash();

    expect(screen.queryByTestId('splash-loading')).toBeNull();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1500);
    });

    expect(screen.getByTestId('splash-loading')).toBeOnTheScreen();
  });

  it('esconde a splash nativa sem fade no primeiro layout, uma vez só', async () => {
    await renderSplash();
    const root = screen.getByTestId('splash-screen');

    await fireEvent(root, 'layout', layout);
    await fireEvent(root, 'layout', layout);

    expect(BootSplash.hide).toHaveBeenCalledTimes(1);
    expect(BootSplash.hide).toHaveBeenCalledWith({ fade: false });
  });

  it('depois do mínimo faz a saída e troca para o Login', async () => {
    const navigation = await renderSplash();
    await fireEvent(screen.getByTestId('splash-screen'), 'layout', layout);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1200);
    });

    expect(navigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Login', params: { fromSplash: true } }],
    });
  });

  it('a saída para o Login mira o centro do logo do Login (util compartilhado)', async () => {
    const actual = splashAnimation.useSplashAnimation;
    const exit = jest.fn();
    const spy = jest
      .spyOn(splashAnimation, 'useSplashAnimation')
      .mockImplementation(options => ({ ...actual(options), exit }));
    await renderSplash();
    await fireEvent(screen.getByTestId('splash-screen'), 'layout', layout);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1200);
    });

    // Insets do mock = 0; raiz de 736 (layout) e a janela do Jest.
    expect(exit).toHaveBeenCalledWith(
      expect.objectContaining({
        destination: 'login',
        loginOffsetY: splashToLoginOffsetY({
          rootHeight: 736,
          windowHeight: Dimensions.get('window').height,
          insetTop: 0,
          insetBottom: 0,
        }),
      }),
    );
    spy.mockRestore();
  });
});

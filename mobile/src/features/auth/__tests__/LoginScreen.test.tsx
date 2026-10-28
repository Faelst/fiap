import { ThemeProvider } from '@shopify/restyle';
import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import type { RootStackScreenProps } from '../../../navigation/types';
import { theme } from '../../../theme';
import { LoginScreen } from '../LoginScreen';

type Props = RootStackScreenProps<'Login'>;

const renderLogin = (params: Props['route']['params']) =>
  render(
    <ThemeProvider theme={theme}>
      <LoginScreen
        navigation={{} as Props['navigation']}
        route={{ key: 'Login-1', name: 'Login', params } as Props['route']}
      />
    </ThemeProvider>,
  );

describe('LoginScreen (placeholder)', () => {
  it('desenha o logo 306×49 no topo + hero, onde a splash o deixa', async () => {
    await renderLogin({ fromSplash: true });

    const logo = screen.getByTestId('login-logo');
    expect(logo).toHaveProp('accessibilityLabel', 'FIAP School');
    expect(StyleSheet.flatten(logo.props.style)).toMatchObject({
      width: 306,
      height: 49,
    });
    // Insets do mock = 0: o topo do logo fica em spacing.hero (80).
    expect(
      StyleSheet.flatten(screen.getByTestId('login-screen').props.style),
    ).toMatchObject({ paddingTop: 80, alignItems: 'center' });
  });
});

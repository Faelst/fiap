import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { PrimaryButton } from '../PrimaryButton';

const baseProps = {
  label: 'FAZER LOGIN',
  accessibilityLabel: 'Fazer login',
  loadingAccessibilityLabel: 'Entrando',
  testID: 'login-submit-button',
  loadingTestID: 'login-submit-loading',
};

describe('PrimaryButton', () => {
  it('desabilitado: mostra o texto em textDisabled e ignora o toque', async () => {
    const onPress = jest.fn();
    await renderWithTheme(
      <PrimaryButton {...baseProps} disabled onPress={onPress} />,
    );

    const button = screen.getByTestId('login-submit-button');
    expect(button.props.accessibilityState).toMatchObject({
      disabled: true,
      busy: false,
    });
    expect(button).toHaveProp('accessibilityRole', 'button');
    expect(button).toHaveProp('accessibilityLabel', 'Fazer login');
    expect(screen.getByText('FAZER LOGIN')).toHaveStyle({
      color: theme.colors.textDisabled,
    });

    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('ativo: texto em textOnPrimary e chama onPress', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<PrimaryButton {...baseProps} onPress={onPress} />);

    const button = screen.getByTestId('login-submit-button');
    expect(button.props.accessibilityState).toMatchObject({ disabled: false });
    expect(screen.getByText('FAZER LOGIN')).toHaveStyle({ color: '#000000' });

    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('carregando: troca o texto pelo spinner, fica busy e ignora o toque', async () => {
    const onPress = jest.fn();
    await renderWithTheme(
      <PrimaryButton {...baseProps} loading onPress={onPress} />,
    );

    const button = screen.getByTestId('login-submit-button');
    expect(screen.queryByText('FAZER LOGIN')).toBeNull();
    expect(screen.getByTestId('login-submit-loading')).toBeOnTheScreen();
    expect(button.props.accessibilityState).toMatchObject({
      disabled: true,
      busy: true,
    });
    expect(button).toHaveProp('accessibilityLabel', 'Entrando');

    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('cobre a área segura de baixo com a cor do botão', async () => {
    await renderWithTheme(
      <PrimaryButton {...baseProps} onPress={jest.fn()} bottomInset={34} />,
    );

    expect(screen.getByTestId('login-submit-button')).toHaveStyle({
      backgroundColor: '#29F4D5',
      paddingBottom: 34,
    });
  });
});

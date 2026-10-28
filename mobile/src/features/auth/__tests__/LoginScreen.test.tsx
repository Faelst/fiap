import { ThemeProvider } from '@shopify/restyle';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { StyleSheet } from 'react-native';
import {
  FadeIn,
  ReduceMotion,
  useReducedMotion,
  withSequence,
} from 'react-native-reanimated';

import { queryClient } from '../../../app/queryClient';
import { strings } from '../../../constants/strings';
import type { RootStackScreenProps } from '../../../navigation/types';
import { useSessionStore } from '../../../stores/session.store';
import { API_URL, loginResponse } from '../../../test/fixtures';
import { server } from '../../../test/msw/server';
import { QueryWrapper } from '../../../test/queryWrapper';
import { theme } from '../../../theme';
import { LoginScreen } from '../LoginScreen';

jest.mock('react-native-reanimated', () => {
  const mock = require('react-native-reanimated/mock');
  const builder: Record<string, jest.Mock> = {};
  for (const method of ['duration', 'delay', 'easing', 'reduceMotion']) {
    builder[method] = jest.fn(() => builder);
  }
  return {
    ...mock,
    useReducedMotion: jest.fn(() => false),
    withSequence: jest.fn(() => 0),
    FadeIn: builder,
  };
});

type Props = RootStackScreenProps<'Login'>;

const renderLogin = (params: Props['route']['params'] = undefined) =>
  render(
    <QueryWrapper>
      <ThemeProvider theme={theme}>
        <LoginScreen
          navigation={{} as Props['navigation']}
          route={{ key: 'Login-1', name: 'Login', params } as Props['route']}
        />
      </ThemeProvider>
    </QueryWrapper>,
  );

const cpfInput = () => screen.getByTestId('login-cpf-input');
const passwordInput = () => screen.getByTestId('login-password-input');
const submitButton = () => screen.getByTestId('login-submit-button');

const fillAndSubmit = async (password: string) => {
  await fireEvent.changeText(cpfInput(), '96929456004');
  await fireEvent.changeText(passwordInput(), password);
  await waitFor(() =>
    expect(submitButton().props.accessibilityState.disabled).toBe(false),
  );
  await act(() => fireEvent.press(submitButton()));
};

describe('LoginScreen', () => {
  beforeEach(async () => {
    await useSessionStore.getState().signOut();
    useSessionStore.setState({ signOutReason: null });
    queryClient.clear();
    jest.mocked(useReducedMotion).mockReturnValue(false);
    jest.mocked(withSequence).mockClear();
  });

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
      StyleSheet.flatten(screen.getByTestId('login-content').props.style),
    ).toMatchObject({ paddingTop: 80, alignItems: 'center' });
  });

  it('vindo da splash com reduzir movimento, o logo faz fade que o sistema não pula', async () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    const fadeIn = FadeIn as unknown as Record<string, jest.Mock>;
    fadeIn.reduceMotion.mockClear();

    await renderLogin({ fromSplash: true });

    expect(fadeIn.duration).toHaveBeenCalledWith(theme.motion.fast);
    expect(fadeIn.reduceMotion).toHaveBeenCalledWith(ReduceMotion.Never);
  });

  it('mostra os campos e o botão FAZER LOGIN desabilitado', async () => {
    await renderLogin();

    expect(screen.getByTestId('login-screen')).toBeOnTheScreen();
    expect(cpfInput()).toHaveProp('returnKeyType', 'next');
    expect(passwordInput()).toHaveProp('secureTextEntry', true);
    expect(passwordInput()).toHaveProp('returnKeyType', 'go');
    expect(passwordInput()).toHaveProp('textContentType', 'password');
    expect(passwordInput()).toHaveProp('accessibilityLabel', 'Senha');
    expect(screen.getByText(strings.login.submit)).toBeOnTheScreen();
    expect(submitButton().props.accessibilityState.disabled).toBe(true);
    expect(screen.queryByTestId('login-error-message')).toBeNull();
  });

  it('CPF mascarado e senha preenchida habilitam o botão', async () => {
    await renderLogin();

    await fireEvent.changeText(cpfInput(), '96929456004');
    await fireEvent.changeText(passwordInput(), '123456');

    expect(cpfInput()).toHaveProp('value', '969.294.560-04');
    await waitFor(() =>
      expect(submitButton().props.accessibilityState.disabled).toBe(false),
    );
  });

  it('senha errada mostra a mensagem do Figma e faz o shake', async () => {
    await renderLogin();

    await fillAndSubmit('errada');

    const message = await screen.findByTestId('login-error-message');
    expect(message).toHaveTextContent(strings.login.error.invalid);
    expect(message).toHaveProp(
      'accessibilityLabel',
      'Usuário ou senha inválida. Pode tentar novamente?',
    );
    expect(message).toHaveProp('accessibilityLiveRegion', 'polite');
    expect(withSequence).toHaveBeenCalled();
  });

  it('com reduzir movimento o erro aparece sem shake', async () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    await renderLogin();

    await fillAndSubmit('errada');

    expect(await screen.findByTestId('login-error-message')).toBeOnTheScreen();
    expect(withSequence).not.toHaveBeenCalled();
  });

  it('enquanto envia mostra o spinner e trava os campos', async () => {
    let release: () => void = () => {};
    server.use(
      http.post(`${API_URL}/auth/login`, async () => {
        await new Promise<void>(resolve => {
          release = resolve;
        });
        return HttpResponse.json(loginResponse);
      }),
    );
    await renderLogin();

    await fillAndSubmit('123456');

    expect(await screen.findByTestId('login-submit-loading')).toBeOnTheScreen();
    expect(cpfInput()).toHaveProp('editable', false);
    expect(passwordInput()).toHaveProp('editable', false);
    expect(submitButton().props.accessibilityState.busy).toBe(true);

    await act(async () => release());
    await waitFor(() =>
      expect(useSessionStore.getState().status).toBe('signedIn'),
    );
    // A mutation avisa o fim num tick seguinte: espera o spinner sair.
    await waitFor(() =>
      expect(screen.queryByTestId('login-submit-loading')).toBeNull(),
    );
  });

  it('sessão expirada abre com o aviso', async () => {
    useSessionStore.setState({ signOutReason: 'expired' });

    await renderLogin({ fromSplash: true });

    expect(screen.getByTestId('login-error-message')).toHaveTextContent(
      strings.login.error.sessionExpired,
    );
  });
});

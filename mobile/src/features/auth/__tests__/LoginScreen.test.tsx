import { ThemeProvider } from '@shopify/restyle';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import { Dimensions, StyleSheet } from 'react-native';
import {
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
import type { RecordedAnimation } from '../../../test/recordingAnimations';
import { theme } from '../../../theme';
import { loginLogoTop } from '../../../utils/loginLayout';
import { LoginScreen } from '../LoginScreen';

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated/mock');
  return {
    ...actual,
    ...jest
      .requireActual('../../../test/recordingAnimations')
      .recordingAnimations(),
    useReducedMotion: jest.fn(() => false),
    withSequence: jest.fn(() => 0),
  };
});

const { colors, motion, sizes } = theme;
const hidden = { includeHiddenElements: true };

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
const entering = (testID: string) =>
  (
    screen.getByTestId(testID, hidden) as unknown as {
      props: { entering?: RecordedAnimation };
    }
  ).props.entering;
const flatStyle = (testID: string) =>
  StyleSheet.flatten(screen.getByTestId(testID, hidden).props.style);

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

  describe('layout', () => {
    it('logo 245 × 39 na posição do util compartilhado com a splash', async () => {
      await renderLogin({ fromSplash: true });

      const logo = screen.getByTestId('login-logo');
      expect(logo).toHaveProp('accessibilityLabel', 'FIAP School');
      expect(StyleSheet.flatten(logo.props.style)).toMatchObject(
        sizes.logoLoginV2,
      );
      // Insets do mock = 0.
      const top = loginLogoTop({
        windowHeight: Dimensions.get('window').height,
        insetTop: 0,
      });
      expect(flatStyle('login-content')).toMatchObject({ paddingTop: top });
    });

    it('halo de 360 decorativo atrás do logo', async () => {
      await renderLogin();

      const halo = screen.getByTestId('login-halo', hidden);
      expect(halo).toHaveProp('pointerEvents', 'none');
      expect(flatStyle('login-halo')).toMatchObject({
        position: 'absolute',
        width: sizes.loginHalo,
        height: sizes.loginHalo,
      });
      expect(screen.queryByTestId('login-halo')).toBeNull();
    });

    it('rolagem sem KeyboardAvoidingView: iOS ajusta o inset do teclado e os toques passam', async () => {
      await renderLogin();

      const scroll = screen.getByTestId('login-scroll');
      expect(scroll).toHaveProp('keyboardShouldPersistTaps', 'handled');
      expect(scroll).toHaveProp('automaticallyAdjustKeyboardInsets', true);
      expect(scroll).toHaveProp('contentInsetAdjustmentBehavior', 'never');
    });

    it('card com título, texto, campos, botão "Entrar" e a ajuda embaixo', async () => {
      await renderLogin();

      expect(screen.getByTestId('login-screen')).toBeOnTheScreen();
      expect(flatStyle('login-card')).toMatchObject({
        backgroundColor: colors.surface,
        maxWidth: sizes.formMaxWidth,
      });
      expect(screen.getByText(strings.login.title)).toBeOnTheScreen();
      expect(screen.getByText(strings.login.subtitle)).toBeOnTheScreen();
      expect(screen.getByText(strings.login.help)).toBeOnTheScreen();
      expect(screen.getByText('Entrar')).toBeOnTheScreen();
      expect(submitButton()).toHaveAccessibleName('Entrar');
      expect(submitButton().props.accessibilityState.disabled).toBe(true);
      expect(screen.queryByTestId('login-error-message')).toBeNull();
    });
  });

  describe('campos', () => {
    it('CPF: teclado numérico, dica "Somente números" e "next"', async () => {
      await renderLogin();

      expect(cpfInput()).toHaveProp('accessibilityLabel', 'CPF');
      expect(cpfInput()).toHaveProp('keyboardType', 'number-pad');
      expect(cpfInput()).toHaveProp('accessibilityHint', 'Somente números');
      expect(cpfInput()).toHaveProp('returnKeyType', 'next');
    });

    it('CPF focado e vazio mostra o placeholder 000.000.000-00', async () => {
      await renderLogin();

      await fireEvent(cpfInput(), 'focus');

      expect(cpfInput()).toHaveProp(
        'placeholder',
        strings.login.cpfPlaceholder,
      );
    });

    it('Senha: oculta, com o olho, "go" e autofill de senha', async () => {
      await renderLogin();

      expect(passwordInput()).toHaveProp('accessibilityLabel', 'Senha');
      expect(passwordInput()).toHaveProp('secureTextEntry', true);
      expect(passwordInput()).toHaveProp('returnKeyType', 'go');
      expect(passwordInput()).toHaveProp('textContentType', 'password');
      expect(passwordInput()).toHaveProp('autoComplete', 'password');

      await fireEvent.press(screen.getByTestId('login-password-input-toggle'));

      expect(passwordInput()).toHaveProp('secureTextEntry', false);
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

    it('CPF com DV errado mostra o erro no campo, não no banner', async () => {
      await renderLogin();

      await fireEvent.changeText(cpfInput(), '96929456005');
      await act(() => fireEvent(cpfInput(), 'blur'));

      expect(
        await screen.findByTestId('login-cpf-input-error'),
      ).toHaveTextContent(strings.login.error.cpf);
      expect(screen.queryByTestId('login-error-message')).toBeNull();
    });
  });

  describe('envio', () => {
    it('senha errada mostra o banner e faz o shake do card', async () => {
      await renderLogin();

      await fillAndSubmit('errada');

      const message = await screen.findByTestId('login-error-message');
      expect(message).toHaveTextContent(strings.login.error.invalid);
      expect(withSequence).toHaveBeenCalled();
      // Em erro de envio a borda dos campos não fica vermelha (3.2).
      expect(flatStyle('login-cpf-input-error-layer').opacity).toBe(0);
    });

    it('com reduzir movimento o erro aparece sem shake', async () => {
      jest.mocked(useReducedMotion).mockReturnValue(true);
      await renderLogin();

      await fillAndSubmit('errada');

      expect(
        await screen.findByTestId('login-error-message'),
      ).toBeOnTheScreen();
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

      expect(
        await screen.findByTestId('login-submit-button-loading'),
      ).toBeOnTheScreen();
      expect(cpfInput()).toHaveProp('editable', false);
      expect(passwordInput()).toHaveProp('editable', false);
      expect(submitButton().props.accessibilityState.busy).toBe(true);
      expect(submitButton()).toHaveAccessibleName('Entrando…');

      await act(async () => release());
      await waitFor(() =>
        expect(useSessionStore.getState().status).toBe('signedIn'),
      );
      await waitFor(() =>
        expect(screen.queryByTestId('login-submit-button-loading')).toBeNull(),
      );
    });

    it('sessão expirada abre com o aviso no banner', async () => {
      useSessionStore.setState({ signOutReason: 'expired' });

      await renderLogin({ fromSplash: true });

      expect(screen.getByTestId('login-error-message')).toHaveTextContent(
        strings.login.error.sessionExpired,
      );
    });
  });

  describe('entrada (4.2)', () => {
    const items = [0, 1, 2, 3, 4];

    it('vindo da splash: logo parado, halo em fade, card sobe com escala e os itens em cascata', async () => {
      await renderLogin({ fromSplash: true });

      expect(entering('login-logo-enter')).toBeUndefined();
      expect(entering('login-halo')).toMatchObject({
        name: 'FadeIn',
        calls: {
          duration: motion.slower,
          reduceMotion: ReduceMotion.Never,
        },
      });
      // FadeInDown só anima o translateY: a escala pede um Keyframe.
      expect(entering('login-card-enter')).toMatchObject({
        name: 'Keyframe',
        keyframes: {
          from: {
            opacity: 0,
            transform: [
              { translateY: motion.enterOffsetCard },
              { scale: motion.loginCardScaleFrom },
            ],
          },
          to: {
            opacity: 1,
            transform: [{ translateY: 0 }, { scale: 1 }],
            easing: motion.emphasized,
          },
        },
        calls: { duration: motion.slow },
      });
      for (const i of items) {
        expect(entering(`login-item-${i}`)).toMatchObject({
          name: 'FadeInDown',
          calls: {
            duration: motion.base,
            delay: motion.loginItemsDelay + i * motion.stagger,
          },
        });
      }
      expect(entering('login-help')).toMatchObject({
        name: 'FadeIn',
        calls: { duration: motion.base, delay: motion.loginHelpDelay },
      });
    });

    it('vindo do logout: o logo também entra com fade', async () => {
      await renderLogin();

      expect(entering('login-logo-enter')).toMatchObject({
        name: 'FadeIn',
        calls: { duration: motion.base },
      });
    });

    it('com reduzir movimento tudo vira FadeIn curto, sem atraso, que o sistema não pula', async () => {
      jest.mocked(useReducedMotion).mockReturnValue(true);

      await renderLogin({ fromSplash: true });

      for (const id of [
        // A splash some em fade e o logo do Login aparece em fade (3.1).
        'login-logo-enter',
        'login-card-enter',
        ...items.map(i => `login-item-${i}`),
        'login-help',
      ]) {
        const animation = entering(id);
        expect(animation).toMatchObject({
          name: 'FadeIn',
          calls: { duration: motion.fast, reduceMotion: ReduceMotion.Never },
        });
        expect(animation?.calls.delay).toBeUndefined();
      }
    });
  });
});

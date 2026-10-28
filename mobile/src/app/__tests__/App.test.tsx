import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import BootSplash from 'react-native-bootsplash';

import { createSecureStorage } from '../../services/storage/secureStorage';
import { useBootStore } from '../../stores/boot.store';
import { useSessionStore } from '../../stores/session.store';
import { API_URL, meWithoutStudents } from '../../test/fixtures';
import { server } from '../../test/msw/server';
import { queryClient } from '../queryClient';
import { App } from '../App';

/** A splash tem duração mínima de 1200 ms (timers reais aqui, por causa do MSW). */
const AFTER_SPLASH = { timeout: 4000 };

const layout = {
  nativeEvent: { layout: { x: 0, y: 0, width: 414, height: 736 } },
};

describe('App', () => {
  beforeEach(async () => {
    await useSessionStore.getState().signOut();
    useSessionStore.setState({ status: 'loading', signOutReason: null });
    useBootStore.setState({ splashDone: false });
    queryClient.clear();
    (BootSplash.hide as jest.Mock).mockClear();
  });

  it('abre na splash JS, esconde a nativa sem fade e, sem token, vai ao Login', async () => {
    await render(<App />);

    const splash = await screen.findByTestId('splash-screen');
    await fireEvent(splash, 'layout', layout);
    expect(BootSplash.hide).toHaveBeenCalledWith({ fade: false });

    expect(
      await screen.findByTestId('login-screen', {}, AFTER_SPLASH),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId('splash-screen')).toBeNull();
    expect(useSessionStore.getState().status).toBe('signedOut');
  });

  it('com token e /me com aluno abre nas abas e a seleção de aluno abre em modal', async () => {
    await createSecureStorage().setToken('jwt-salvo');

    await render(<App />);

    expect(
      await screen.findByTestId('agenda-screen', {}, AFTER_SPLASH),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId('login-screen')).toBeNull();

    await act(() =>
      fireEvent.press(screen.getByTestId('header-switch-student-button')),
    );
    expect(
      await screen.findByTestId('select-student-screen'),
    ).toBeOnTheScreen();
  });

  it('com token e /me sem aluno abre no NoStudent', async () => {
    await createSecureStorage().setToken('jwt-salvo');
    server.use(
      http.get(`${API_URL}/me`, () => HttpResponse.json(meWithoutStudents)),
    );

    await render(<App />);

    expect(
      await screen.findByTestId('no-student-screen', {}, AFTER_SPLASH),
    ).toBeOnTheScreen();
  });

  it('com token e API fora do ar abre no BootError', async () => {
    await createSecureStorage().setToken('jwt-salvo');
    server.use(http.get(`${API_URL}/me`, () => HttpResponse.error()));

    await render(<App />);

    expect(
      await screen.findByTestId('boot-error-screen', {}, AFTER_SPLASH),
    ).toBeOnTheScreen();
  });

  it('com token expirado (/me 401) limpa a sessão e vai ao Login', async () => {
    await createSecureStorage().setToken('jwt-vencido');
    server.use(
      http.get(`${API_URL}/me`, () =>
        HttpResponse.json(
          { statusCode: 401, message: 'Unauthorized' },
          { status: 401 },
        ),
      ),
    );

    await render(<App />);

    expect(
      await screen.findByTestId('login-screen', {}, AFTER_SPLASH),
    ).toBeOnTheScreen();
    expect(useSessionStore.getState()).toMatchObject({
      status: 'signedOut',
      signOutReason: 'expired',
    });
    expect(await createSecureStorage().getToken()).toBeNull();
  });

  it('quando a sessão acaba (logout ou 401) volta ao Login, sem passar pela splash', async () => {
    await createSecureStorage().setToken('jwt-salvo');
    await render(<App />);
    expect(
      await screen.findByTestId('agenda-screen', {}, AFTER_SPLASH),
    ).toBeOnTheScreen();

    await act(() => useSessionStore.getState().signOut('expired'));

    expect(await screen.findByTestId('login-screen')).toBeOnTheScreen();
    expect(screen.queryByTestId('splash-screen')).toBeNull();
  });

  it('SAIR no Boletim apaga o token e volta ao Login', async () => {
    await createSecureStorage().setToken('jwt-salvo');
    await render(<App />);
    expect(
      await screen.findByTestId('agenda-screen', {}, AFTER_SPLASH),
    ).toBeOnTheScreen();

    await act(() => fireEvent.press(screen.getByTestId('tab-boletim')));
    await act(() =>
      fireEvent.press(screen.getByTestId('header-logout-button')),
    );

    expect(await screen.findByTestId('login-screen')).toBeOnTheScreen();
    expect(await createSecureStorage().getToken()).toBeNull();
  });
});

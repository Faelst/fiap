import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { http, HttpResponse } from 'msw';
import BootSplash from 'react-native-bootsplash';

import { createSecureStorage } from '../../services/storage/secureStorage';
import { useBootStore } from '../../stores/boot.store';
import { useSessionStore } from '../../stores/session.store';
import { API_URL, meResponse, meWithoutStudents } from '../../test/fixtures';
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

  it('login com CPF e senha certos entra nas abas e guarda o token', async () => {
    await render(<App />);
    await fireEvent(
      await screen.findByTestId('splash-screen'),
      'layout',
      layout,
    );
    const cpf = await screen.findByTestId('login-cpf-input', {}, AFTER_SPLASH);

    await fireEvent.changeText(cpf, '96929456004');
    await fireEvent.changeText(
      screen.getByTestId('login-password-input'),
      '123456',
    );
    await act(() => fireEvent.press(screen.getByTestId('login-submit-button')));

    expect(await screen.findByTestId('agenda-screen')).toBeOnTheScreen();
    expect(screen.queryByTestId('login-screen')).toBeNull();
    expect(await createSecureStorage().getToken()).toBe('jwt-gustavo');
  });

  it('login de responsável sem aluno abre o NoStudent, não as abas', async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json({
          accessToken: 'jwt-carlos',
          guardian: { id: 'g9', firstName: 'Carlos', lastName: 'Sem Aluno' },
        }),
      ),
      http.get(`${API_URL}/me`, () => HttpResponse.json(meWithoutStudents)),
    );
    await render(<App />);
    await fireEvent(
      await screen.findByTestId('splash-screen'),
      'layout',
      layout,
    );
    const cpf = await screen.findByTestId('login-cpf-input', {}, AFTER_SPLASH);

    await fireEvent.changeText(cpf, '31415926590');
    await fireEvent.changeText(
      screen.getByTestId('login-password-input'),
      '111111',
    );
    await act(() => fireEvent.press(screen.getByTestId('login-submit-button')));

    expect(await screen.findByTestId('no-student-screen')).toBeOnTheScreen();
    expect(screen.queryByTestId('agenda-screen')).toBeNull();
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

  it('Header nas abas: responsável, aluno e TROCAR PERFIL; trocar no Boletim volta ao Boletim com o aluno novo', async () => {
    await createSecureStorage().setToken('jwt-salvo');
    await render(<App />);
    expect(
      await screen.findByTestId('agenda-screen', {}, AFTER_SPLASH),
    ).toBeOnTheScreen();
    expect(screen.getByTestId('header-greeting')).toHaveTextContent(
      'Olá, Gustavo',
    );
    expect(screen.getByTestId('header-student-name')).toHaveTextContent(
      'Rafael',
    );
    expect(useSessionStore.getState().selectedStudentId).toBe('s1');

    await act(() => fireEvent.press(screen.getByTestId('tab-boletim')));
    expect(await screen.findByTestId('boletim-screen')).toBeOnTheScreen();
    const switchButtons = screen.getAllByTestId('header-switch-student-button');
    await act(() => fireEvent.press(switchButtons[switchButtons.length - 1]));

    expect(
      await screen.findByTestId('select-student-screen'),
    ).toBeOnTheScreen();
    expect(screen.getByTestId('select-student-card-12567')).toBeSelected();
    await act(() =>
      fireEvent.press(screen.getByTestId('select-student-card-12568')),
    );

    await waitFor(() =>
      expect(screen.queryByTestId('select-student-screen')).toBeNull(),
    );
    expect(screen.getByTestId('boletim-screen')).toBeOnTheScreen();
    expect(useSessionStore.getState().selectedStudentId).toBe('s2');
    expect(
      screen
        .getAllByTestId('header-student-name')
        .some(node => node.props.children === 'Marina'),
    ).toBe(true);
  });

  it('com um aluno só, o Header não tem TROCAR PERFIL', async () => {
    await createSecureStorage().setToken('jwt-salvo');
    server.use(
      http.get(`${API_URL}/me`, () =>
        HttpResponse.json({
          ...meResponse,
          firstName: 'Adelaide',
          students: [meResponse.students[0]],
        }),
      ),
    );
    await render(<App />);

    expect(
      await screen.findByTestId('agenda-screen', {}, AFTER_SPLASH),
    ).toBeOnTheScreen();
    expect(screen.getByTestId('header-greeting')).toHaveTextContent(
      'Olá, Adelaide',
    );
    expect(screen.queryByTestId('header-switch-student-button')).toBeNull();
    expect(screen.getByTestId('header-logout-button')).toBeOnTheScreen();
  });

  it('NoStudent real: saudação, estado vazio e SAIR leva ao Login', async () => {
    await createSecureStorage().setToken('jwt-salvo');
    server.use(
      http.get(`${API_URL}/me`, () => HttpResponse.json(meWithoutStudents)),
    );
    await render(<App />);

    expect(
      await screen.findByTestId('no-student-screen', {}, AFTER_SPLASH),
    ).toBeOnTheScreen();
    expect(screen.getByTestId('header-greeting')).toHaveTextContent(
      'Olá, Carlos',
    );
    expect(screen.getByText('Nenhum aluno vinculado')).toBeOnTheScreen();
    expect(screen.queryByTestId('tab-bar')).toBeNull();

    await act(() =>
      fireEvent.press(screen.getByTestId('header-logout-button')),
    );
    expect(await screen.findByTestId('login-screen')).toBeOnTheScreen();
  });

  it('BootError: TENTAR DE NOVO com a API de volta abre as abas', async () => {
    await createSecureStorage().setToken('jwt-salvo');
    server.use(http.get(`${API_URL}/me`, () => HttpResponse.error()));
    await render(<App />);
    expect(
      await screen.findByTestId('boot-error-screen', {}, AFTER_SPLASH),
    ).toBeOnTheScreen();
    expect(screen.getByText('Não conseguimos conectar.')).toBeOnTheScreen();

    server.resetHandlers();
    await act(() => fireEvent.press(screen.getByTestId('boot-error-retry')));

    expect(await screen.findByTestId('agenda-screen')).toBeOnTheScreen();
    expect(screen.getByTestId('tab-bar')).toBeOnTheScreen();
  });
});

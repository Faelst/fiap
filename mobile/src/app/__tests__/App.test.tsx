import { act, fireEvent, render, screen } from '@testing-library/react-native';
import BootSplash from 'react-native-bootsplash';

import { createSecureStorage } from '../../services/storage/secureStorage';
import { useSessionStore } from '../../stores/session.store';
import { App } from '../App';

describe('App', () => {
  beforeEach(async () => {
    await useSessionStore.getState().signOut();
    useSessionStore.setState({ status: 'loading', signOutReason: null });
    (BootSplash.hide as jest.Mock).mockClear();
  });

  it('sem token abre no Login e esconde a splash nativa', async () => {
    await render(<App />);

    expect(await screen.findByTestId('login-screen')).toBeOnTheScreen();
    expect(useSessionStore.getState().status).toBe('signedOut');
    expect(BootSplash.hide).toHaveBeenCalledWith({ fade: true });
  });

  it('com token no keychain abre direto nas abas e a seleção de aluno abre em modal', async () => {
    await createSecureStorage().setToken('jwt-salvo');

    await render(<App />);

    expect(await screen.findByTestId('agenda-screen')).toBeOnTheScreen();
    expect(screen.queryByTestId('login-screen')).toBeNull();

    await act(() =>
      fireEvent.press(screen.getByTestId('header-switch-student-button')),
    );
    expect(
      await screen.findByTestId('select-student-screen'),
    ).toBeOnTheScreen();
  });

  it('quando a sessão acaba (logout ou 401) volta ao Login', async () => {
    await createSecureStorage().setToken('jwt-salvo');
    await render(<App />);
    expect(await screen.findByTestId('agenda-screen')).toBeOnTheScreen();

    await act(() => useSessionStore.getState().signOut('expired'));

    expect(await screen.findByTestId('login-screen')).toBeOnTheScreen();
  });

  it('SAIR no Boletim apaga o token e volta ao Login', async () => {
    await createSecureStorage().setToken('jwt-salvo');
    await render(<App />);
    expect(await screen.findByTestId('agenda-screen')).toBeOnTheScreen();

    await act(() => fireEvent.press(screen.getByTestId('tab-boletim')));
    await act(() =>
      fireEvent.press(screen.getByTestId('header-logout-button')),
    );

    expect(await screen.findByTestId('login-screen')).toBeOnTheScreen();
    expect(await createSecureStorage().getToken()).toBeNull();
  });
});

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import BootSplash from 'react-native-bootsplash';

import { App } from '../App';

describe('App', () => {
  it('abre no Login e esconde a splash nativa quando a navegação fica pronta', async () => {
    await render(<App />);

    expect(await screen.findByTestId('login-screen')).toBeOnTheScreen();
    expect(BootSplash.hide).toHaveBeenCalledWith({ fade: true });
  });

  it('vai do Login para as abas e abre a seleção de aluno em modal', async () => {
    await render(<App />);

    await act(() => fireEvent.press(screen.getByTestId('login-submit-button')));
    expect(await screen.findByTestId('agenda-screen')).toBeOnTheScreen();

    await act(() =>
      fireEvent.press(screen.getByTestId('header-switch-student-button')),
    );
    expect(
      await screen.findByTestId('select-student-screen'),
    ).toBeOnTheScreen();
  });
});

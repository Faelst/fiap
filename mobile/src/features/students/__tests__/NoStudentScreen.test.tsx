import { ThemeProvider } from '@shopify/restyle';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { queryClient, queryKeys } from '../../../app/queryClient';
import { useSessionStore } from '../../../stores/session.store';
import { meWithoutStudents } from '../../../test/fixtures';
import { QueryWrapper } from '../../../test/queryWrapper';
import { theme } from '../../../theme';
import { NoStudentScreen } from '../NoStudentScreen';

const { colors, sizes } = theme;

const renderScreen = () =>
  render(
    <QueryWrapper>
      <ThemeProvider theme={theme}>
        <NoStudentScreen />
      </ThemeProvider>
    </QueryWrapper>,
  );

describe('NoStudentScreen', () => {
  beforeEach(() => {
    queryClient.clear();
    queryClient.setQueryData(queryKeys.me(), meWithoutStudents);
    useSessionStore.setState({ status: 'signedIn', signOutReason: null });
  });

  it('header compacto: logo, "Olá, Carlos" e o título "Sua conta", sem chip', async () => {
    await renderScreen();

    expect(screen.getByTestId('no-student-screen')).toBeOnTheScreen();
    expect(screen.getByLabelText('FIAP School')).toBeOnTheScreen();
    expect(screen.getByTestId('header-greeting')).toHaveTextContent(
      'Olá, Carlos',
    );
    const title = screen.getByTestId('no-student-title');
    expect(title).toHaveTextContent('Sua conta');
    expect(title).toHaveProp('accessibilityRole', 'header');
    expect(screen.queryByTestId('header-student-chip')).toBeNull();
  });

  it('estado vazio neutro com o texto da v1, centralizado na sobra da tela', async () => {
    await renderScreen();

    expect(screen.getByTestId('no-student-body')).toHaveStyle({
      flex: 1,
      justifyContent: 'center',
    });
    expect(screen.getByTestId('no-student-body')).toContainElement(
      screen.getByTestId('no-student-empty'),
    );
    expect(screen.getByText('Nenhum aluno vinculado')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Não encontramos alunos ligados ao seu CPF. Fale com a secretaria da FIAP School para fazer o vínculo.',
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId('no-student-empty-icon', {
        includeHiddenElements: true,
      }),
    ).toHaveStyle({ backgroundColor: colors.surfaceRaised });
  });

  it('Sair: pílula secundária pequena que sai na hora, sem confirmação (DV7)', async () => {
    await renderScreen();

    const logout = screen.getByTestId('no-student-logout-button');
    expect(logout).toHaveAccessibleName('Sair');
    expect(screen.getByTestId('no-student-logout-button-surface')).toHaveStyle({
      height: sizes.pill.sm,
      backgroundColor: colors.surfaceRaised,
    });
    expect(screen.queryByTestId('header-logout-button')).toBeNull();

    await fireEvent.press(logout);

    expect(useSessionStore.getState()).toMatchObject({
      status: 'signedOut',
      signOutReason: 'manual',
    });
  });
});

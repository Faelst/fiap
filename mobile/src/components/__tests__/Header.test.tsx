import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { Header } from '../Header';

const rafael = {
  id: 's1',
  firstName: 'Rafael',
  rm: 12567,
  className: '7EF',
  period: 'Matutino',
};

describe('Header', () => {
  const onSwitchStudent = jest.fn();
  const onLogout = jest.fn();

  beforeEach(() => {
    onSwitchStudent.mockClear();
    onLogout.mockClear();
  });

  it('com mais de um aluno: saudação, aluno, TROCAR PERFIL e SAIR', async () => {
    await renderWithTheme(
      <Header
        guardianFirstName="Gustavo"
        student={rafael}
        canSwitchStudent
        onSwitchStudent={onSwitchStudent}
        onLogout={onLogout}
      />,
    );

    expect(screen.getByTestId('header')).toBeOnTheScreen();
    expect(screen.getByTestId('header-greeting')).toHaveTextContent(
      'Olá, Gustavo',
    );
    expect(screen.getByTestId('header-greeting')).toHaveAccessibleName(
      'Olá, Gustavo',
    );
    expect(screen.getByTestId('header-student-name')).toHaveTextContent(
      'Rafael',
    );
    expect(screen.getByTestId('header-student-info')).toHaveTextContent(
      '7EF - RM 12567 - Matutino',
    );
    expect(
      screen.getByLabelText(
        'Aluno Rafael, turma 7EF, RM 12567, período Matutino',
      ),
    ).toBeOnTheScreen();

    const switchButton = screen.getByTestId('header-switch-student-button');
    expect(switchButton).toHaveTextContent('TROCAR PERFIL');
    expect(switchButton).toHaveAccessibleName('Trocar aluno');
    await fireEvent.press(switchButton);
    expect(onSwitchStudent).toHaveBeenCalledTimes(1);

    const logout = screen.getByTestId('header-logout-button');
    expect(logout).toHaveAccessibleName('Sair da conta');
    await fireEvent.press(logout);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('nome em maiúsculas pela variante, não pela string', async () => {
    await renderWithTheme(
      <Header
        guardianFirstName="Gustavo"
        student={rafael}
        canSwitchStudent
        onSwitchStudent={onSwitchStudent}
        onLogout={onLogout}
      />,
    );

    expect(screen.getByText('Gustavo')).toHaveStyle({
      textTransform: 'uppercase',
    });
    expect(screen.getByTestId('header-student-name')).toHaveStyle({
      textTransform: 'uppercase',
    });
  });

  it('com um aluno só, não mostra TROCAR PERFIL', async () => {
    await renderWithTheme(
      <Header
        guardianFirstName="Adelaide"
        student={rafael}
        canSwitchStudent={false}
        onSwitchStudent={onSwitchStudent}
        onLogout={onLogout}
      />,
    );

    expect(screen.queryByTestId('header-switch-student-button')).toBeNull();
    expect(screen.getByTestId('header-logout-button')).toBeOnTheScreen();
  });

  it('sem aluno (NoStudent), só a saudação, e o conteúdo vem abaixo', async () => {
    const { Text } = jest.requireActual('react-native');
    await renderWithTheme(
      <Header
        guardianFirstName="Carlos"
        canSwitchStudent={false}
        onSwitchStudent={onSwitchStudent}
        onLogout={onLogout}
      >
        <Text testID="conteudo">conteúdo</Text>
      </Header>,
    );

    expect(screen.getByTestId('header-greeting')).toHaveTextContent(
      'Olá, Carlos',
    );
    expect(screen.queryByTestId('header-student-name')).toBeNull();
    expect(screen.getByTestId('conteudo')).toBeOnTheScreen();
  });

  it('SAIR desabilitado enquanto a sessão sai', async () => {
    await renderWithTheme(
      <Header
        guardianFirstName="Gustavo"
        student={rafael}
        canSwitchStudent
        onSwitchStudent={onSwitchStudent}
        onLogout={onLogout}
        logoutDisabled
      />,
    );

    const logout = screen.getByTestId('header-logout-button');
    expect(logout).toBeDisabled();
    await fireEvent.press(logout);
    expect(onLogout).not.toHaveBeenCalled();
  });

  it('barra de ações com a altura do tema', async () => {
    await renderWithTheme(
      <Header
        guardianFirstName="Gustavo"
        canSwitchStudent={false}
        onSwitchStudent={onSwitchStudent}
        onLogout={onLogout}
      />,
    );

    expect(screen.getByTestId('header-action-bar')).toHaveStyle({
      height: theme.sizes.actionBar,
    });
  });

  it('TROCAR PERFIL e SAIR tocáveis na altura toda da barra (alvo ≥ 44)', async () => {
    await renderWithTheme(
      <Header
        guardianFirstName="Gustavo"
        student={rafael}
        canSwitchStudent
        onSwitchStudent={onSwitchStudent}
        onLogout={onLogout}
      />,
    );

    for (const id of ['header-switch-student-button', 'header-logout-button']) {
      expect(screen.getByTestId(id)).toHaveStyle({
        height: theme.sizes.actionBar,
      });
    }
    expect(theme.sizes.actionBar).toBeGreaterThanOrEqual(
      theme.sizes.touchTarget,
    );
  });

  it('contentInsetBottom: a rolagem termina acima da tab bar flutuante', async () => {
    await renderWithTheme(
      <Header
        guardianFirstName="Gustavo"
        student={rafael}
        canSwitchStudent
        onSwitchStudent={onSwitchStudent}
        onLogout={onLogout}
        contentInsetBottom={96}
      />,
    );

    const scroll = screen.getByTestId('header-scroll');
    expect(scroll.props.contentContainerStyle).toEqual(
      expect.arrayContaining([{ paddingBottom: 96 }]),
    );
    expect(scroll).toHaveProp('scrollIndicatorInsets', { bottom: 96 });
  });

  it('sem contentInsetBottom (tela sem tab bar), sem padding extra', async () => {
    await renderWithTheme(
      <Header
        guardianFirstName="Carlos"
        canSwitchStudent={false}
        onSwitchStudent={onSwitchStudent}
        onLogout={onLogout}
      />,
    );

    const scroll = screen.getByTestId('header-scroll');
    expect(scroll.props.contentContainerStyle).toEqual(
      expect.arrayContaining([{ paddingBottom: 0 }]),
    );
  });
});

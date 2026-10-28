import { ThemeProvider } from '@shopify/restyle';
import { useIsFocused } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { queryClient, queryKeys } from '../../../app/queryClient';
import { createSecureStorage } from '../../../services/storage/secureStorage';
import { useSessionStore } from '../../../stores/session.store';
import { meResponse } from '../../../test/fixtures';
import { QueryWrapper } from '../../../test/queryWrapper';
import { theme } from '../../../theme';
import { ProfileScreen } from '../ProfileScreen';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useIsFocused: jest.fn(() => true),
}));

const focusedMock = useIsFocused as jest.Mock;
const hidden = { includeHiddenElements: true };
const { colors, sizes, spacing } = theme;

const renderScreen = () =>
  render(
    <QueryWrapper>
      <ThemeProvider theme={theme}>
        <ProfileScreen />
      </ThemeProvider>
    </QueryWrapper>,
  );

describe('ProfileScreen', () => {
  beforeEach(async () => {
    focusedMock.mockReturnValue(true);
    await createSecureStorage().setToken('jwt-salvo');
    useSessionStore.setState({
      status: 'signedIn',
      selectedStudentId: 's1',
      signOutReason: null,
    });
    queryClient.clear();
    queryClient.setQueryData(queryKeys.me(), meResponse);
    jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('título Perfil e o card do responsável com nome, papel e CPF mascarado', async () => {
    await renderScreen();

    expect(screen.getByTestId('profile-screen')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-title')).toHaveTextContent('Perfil');
    expect(screen.getByTestId('profile-title')).toHaveProp(
      'accessibilityRole',
      'header',
    );
    const card = screen.getByTestId('profile-guardian-card');
    expect(card).toHaveAccessibleName(
      'Gustavo da Silva, responsável. CPF ***.294.560-**',
    );
    expect(
      screen.getByTestId('profile-guardian-name', hidden),
    ).toHaveTextContent('Gustavo da Silva');
    expect(
      screen.getByTestId('profile-guardian-cpf', hidden),
    ).toHaveTextContent('***.294.560-**');
    expect(screen.getByText('Responsável', hidden)).toBeTruthy();
    expect(screen.getByText('GS', hidden)).toBeTruthy();
  });

  it('lista os alunos com o atual destacado e a dica (2+ alunos)', async () => {
    await renderScreen();

    expect(screen.getByText('Alunos')).toHaveProp(
      'accessibilityRole',
      'header',
    );
    expect(screen.getByTestId('profile-students-hint')).toHaveTextContent(
      'Toque em um aluno para ver as aulas e o boletim dele.',
    );
    expect(screen.getByTestId('profile-student-12567')).toBeSelected();
    expect(screen.getByTestId('profile-student-12568')).not.toBeSelected();
    expect(
      screen.getByTestId('profile-student-12567-current', hidden),
    ).toBeTruthy();
    expect(
      screen.queryByTestId('profile-student-12568-current', hidden),
    ).toBeNull();
  });

  it('tocar em outro aluno troca na hora, sem sair do Perfil', async () => {
    await renderScreen();

    await fireEvent.press(screen.getByTestId('profile-student-12568'));

    expect(useSessionStore.getState().selectedStudentId).toBe('s2');
    expect(screen.getByTestId('profile-screen')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-student-12568')).toBeSelected();
    expect(
      screen.getByTestId('profile-student-12568-current', hidden),
    ).toBeTruthy();
    expect(
      screen.queryByTestId('profile-student-12567-current', hidden),
    ).toBeNull();
  });

  it('com 1 aluno: a linha é o atual, sem dica e sem troca', async () => {
    queryClient.setQueryData(queryKeys.me(), {
      ...meResponse,
      students: [meResponse.students[0]],
    });
    await renderScreen();

    expect(screen.queryByTestId('profile-students-hint')).toBeNull();
    expect(screen.getByTestId('profile-student-12567')).toHaveProp(
      'accessibilityRole',
      'text',
    );
    expect(
      screen.getByTestId('profile-student-12567-current', hidden),
    ).toBeTruthy();
  });

  it('Sair pede confirmação e Sair confirmado faz o logout completo', async () => {
    await renderScreen();
    expect(screen.getByText('Conta')).toHaveProp('accessibilityRole', 'header');

    await fireEvent.press(screen.getByTestId('profile-logout-button'));
    expect(screen.getByText('Sair deste aparelho?')).toBeOnTheScreen();
    expect(useSessionStore.getState().status).toBe('signedIn');

    await fireEvent.press(screen.getByTestId('profile-logout-confirm'));

    expect(useSessionStore.getState()).toMatchObject({
      status: 'signedOut',
      selectedStudentId: null,
      signOutReason: 'manual',
    });
    expect(await createSecureStorage().getToken()).toBeNull();
  });

  it('Cancelar volta para "Sair da conta"', async () => {
    await renderScreen();

    await fireEvent.press(screen.getByTestId('profile-logout-button'));
    await fireEvent.press(screen.getByTestId('profile-logout-cancel'));

    expect(screen.getByTestId('profile-logout-button')).toBeOnTheScreen();
    expect(useSessionStore.getState().status).toBe('signedIn');
  });

  it('sair da aba desfaz a confirmação', async () => {
    const { rerender } = await renderScreen();
    await fireEvent.press(screen.getByTestId('profile-logout-button'));

    focusedMock.mockReturnValue(false);
    await rerender(
      <QueryWrapper>
        <ThemeProvider theme={theme}>
          <ProfileScreen />
        </ThemeProvider>
      </QueryWrapper>,
    );

    expect(screen.getByTestId('profile-logout-button')).toBeOnTheScreen();
  });

  it('a rolagem termina acima da tab bar flutuante e puxa para atualizar em teal', async () => {
    await renderScreen();

    const scroll = screen.getByTestId('profile-scroll');
    const inset = sizes.floatingTabBar.height + 2 * spacing.m;
    expect(scroll.props.contentContainerStyle).toEqual(
      expect.objectContaining({ paddingBottom: inset }),
    );
    expect(scroll).toHaveProp('scrollIndicatorInsets', { bottom: inset });
    const refresh = scroll.props.refreshControl;
    expect(refresh.props.tintColor).toBe(colors.primary);
    expect(refresh.props.refreshing).toBe(false);
  });
});

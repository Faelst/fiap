import { ThemeProvider } from '@shopify/restyle';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ComponentProps } from 'react';

import { queryClient } from '../../../app/queryClient';
import { useSessionStore } from '../../../stores/session.store';
import { QueryWrapper } from '../../../test/queryWrapper';
import { theme } from '../../../theme';
import { BootErrorScreen } from '../BootErrorScreen';

const { colors, sizes } = theme;

type Props = ComponentProps<typeof BootErrorScreen>;

const renderScreen = () => {
  const props = {
    navigation: { reset: jest.fn() },
    route: { key: 'BootError', name: 'BootError' },
  } as unknown as Props;
  return render(
    <QueryWrapper>
      <ThemeProvider theme={theme}>
        <BootErrorScreen {...props} />
      </ThemeProvider>
    </QueryWrapper>,
  );
};

describe('BootErrorScreen', () => {
  beforeEach(() => {
    queryClient.clear();
    useSessionStore.setState({ status: 'signedIn', signOutReason: null });
  });

  it('header compacto só com o logo e o título "Sem conexão" (sem saudação: o /me falhou)', async () => {
    await renderScreen();

    expect(screen.getByTestId('boot-error-screen')).toBeOnTheScreen();
    expect(screen.getByLabelText('FIAP School')).toBeOnTheScreen();
    const title = screen.getByTestId('boot-error-title');
    expect(title).toHaveTextContent('Sem conexão');
    expect(title).toHaveProp('accessibilityRole', 'header');
    expect(screen.queryByTestId('header-greeting')).toBeNull();
    expect(screen.queryByTestId('header-student-chip')).toBeNull();
  });

  it('erro centralizado com o texto da v1 e Tentar de novo como pílula primária grande', async () => {
    await renderScreen();

    expect(screen.getByTestId('boot-error-body')).toHaveStyle({
      flex: 1,
      justifyContent: 'center',
    });
    expect(screen.getByText('Não conseguimos conectar.')).toBeOnTheScreen();
    expect(screen.getByTestId('boot-error-retry-surface')).toHaveStyle({
      height: sizes.pill.md,
      backgroundColor: colors.primary,
    });
  });

  it('Sair embaixo, em pílula ghost pequena, sai na hora e funciona offline', async () => {
    await renderScreen();

    const logout = screen.getByTestId('boot-error-logout-button');
    expect(logout).toHaveAccessibleName('Sair');
    expect(screen.getByTestId('boot-error-actions')).toContainElement(logout);
    expect(screen.getByTestId('boot-error-logout-button-surface')).toHaveStyle({
      height: sizes.pill.sm,
    });
    expect(screen.queryByTestId('header-logout-button')).toBeNull();

    await fireEvent.press(logout);

    expect(useSessionStore.getState()).toMatchObject({
      status: 'signedOut',
      signOutReason: 'manual',
    });
  });
});

import { fireEvent, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { ErrorState } from '../ErrorState';
import { WifiOffIcon } from '../icons/WifiOffIcon';

describe('ErrorState', () => {
  const base = {
    title: 'Não conseguimos conectar.',
    description: 'Confira sua conexão e tente de novo.',
    testID: 'boot-error',
    announce: true,
  };

  it('título, descrição e Tentar de novo com o testID derivado', async () => {
    const onRetry = jest.fn();
    await renderWithTheme(
      <ErrorState {...base} onRetry={onRetry} retrying={false} />,
    );

    expect(screen.getByText('Não conseguimos conectar.')).toBeOnTheScreen();
    expect(
      screen.getByText('Confira sua conexão e tente de novo.'),
    ).toBeOnTheScreen();
    const retry = screen.getByTestId('boot-error-retry');
    expect(retry).toHaveTextContent('Tentar de novo');
    expect(retry).toHaveAccessibleName('Tentar de novo');
    await fireEvent.press(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('estado vazio em tom de perigo, com o AlertIcon por padrão', async () => {
    await renderWithTheme(
      <ErrorState {...base} onRetry={jest.fn()} retrying={false} />,
    );

    expect(
      screen.getByTestId('boot-error-icon', { includeHiddenElements: true }),
    ).toHaveStyle({ backgroundColor: theme.colors.accentMuted });
  });

  it('aceita outro ícone (WifiOffIcon no BootError)', async () => {
    const { toJSON } = await renderWithTheme(
      <ErrorState
        {...base}
        icon={WifiOffIcon}
        onRetry={jest.fn()}
        retrying={false}
      />,
    );

    // O WifiOffIcon tem 4 traços (3 arcos e a barra); o AlertIcon, 1.
    const paths = JSON.stringify(toJSON()).match(/RNSVGPath/g) ?? [];
    expect(paths.length).toBeGreaterThanOrEqual(4);
  });

  it('o retry é uma pílula secundária pequena (44)', async () => {
    await renderWithTheme(
      <ErrorState {...base} onRetry={jest.fn()} retrying={false} />,
    );

    expect(screen.getByTestId('boot-error-retry-surface')).toHaveStyle({
      height: theme.sizes.pill.sm,
      backgroundColor: theme.colors.surfaceRaised,
    });
  });

  it('tentando: spinner no botão, busy e sem novo toque', async () => {
    const onRetry = jest.fn();
    await renderWithTheme(<ErrorState {...base} onRetry={onRetry} retrying />);

    const retry = screen.getByTestId('boot-error-retry');
    expect(retry).toBeBusy();
    expect(screen.getByTestId('boot-error-retry-loading')).toBeOnTheScreen();
    await fireEvent.press(retry);
    expect(onRetry).not.toHaveBeenCalled();
  });

  describe('leitor de tela (3.8)', () => {
    const announce = AccessibilityInfo.announceForAccessibility as jest.Mock;
    const spoken =
      'Não conseguimos conectar. Confira sua conexão e tente de novo.';

    beforeEach(() => announce.mockClear());

    it('anuncia título e descrição quando o erro aparece', async () => {
      await renderWithTheme(
        <ErrorState {...base} onRetry={jest.fn()} retrying={false} />,
      );

      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenCalledWith(spoken);
    });

    it('o spinner do TENTAR DE NOVO não repete o anúncio', async () => {
      const { rerender } = await renderWithTheme(
        <ErrorState {...base} onRetry={jest.fn()} retrying={false} />,
      );
      await rerender(<ErrorState {...base} onRetry={jest.fn()} retrying />);
      await rerender(
        <ErrorState {...base} onRetry={jest.fn()} retrying={false} />,
      );

      expect(announce).toHaveBeenCalledTimes(1);
    });

    it('anuncia de novo, uma vez, a cada TENTAR DE NOVO que falha', async () => {
      const { rerender } = await renderWithTheme(
        <ErrorState {...base} onRetry={jest.fn()} retrying={false} />,
      );
      await rerender(
        <ErrorState {...base} onRetry={jest.fn()} retrying shakeKey={0} />,
      );
      await rerender(
        <ErrorState
          {...base}
          onRetry={jest.fn()}
          retrying={false}
          shakeKey={1}
        />,
      );

      expect(announce).toHaveBeenCalledTimes(2);
      expect(announce).toHaveBeenLastCalledWith(spoken);

      await rerender(
        <ErrorState
          {...base}
          onRetry={jest.fn()}
          retrying={false}
          shakeKey={2}
        />,
      );
      expect(announce).toHaveBeenCalledTimes(3);
    });

    it('fora de foco (aba escondida) não anuncia', async () => {
      await renderWithTheme(
        <ErrorState
          {...base}
          announce={false}
          onRetry={jest.fn()}
          retrying={false}
        />,
      );

      expect(announce).not.toHaveBeenCalled();
    });

    it('anuncia uma vez quando a tela com o erro ganha foco', async () => {
      const { rerender } = await renderWithTheme(
        <ErrorState
          {...base}
          announce={false}
          onRetry={jest.fn()}
          retrying={false}
          shakeKey={1}
        />,
      );
      await rerender(
        <ErrorState
          {...base}
          announce
          onRetry={jest.fn()}
          retrying={false}
          shakeKey={1}
        />,
      );
      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenCalledWith(spoken);

      await rerender(
        <ErrorState
          {...base}
          announce={false}
          onRetry={jest.fn()}
          retrying={false}
          shakeKey={1}
        />,
      );
      expect(announce).toHaveBeenCalledTimes(1);
    });
  });
});

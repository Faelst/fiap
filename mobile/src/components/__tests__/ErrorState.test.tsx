import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  const base = {
    title: 'Não conseguimos conectar.',
    description: 'Confira sua conexão e tente de novo.',
    testID: 'boot-error',
  };

  it('título, descrição e TENTAR DE NOVO com o testID derivado', async () => {
    const onRetry = jest.fn();
    await renderWithTheme(
      <ErrorState {...base} onRetry={onRetry} retrying={false} />,
    );

    expect(screen.getByText('Não conseguimos conectar.')).toBeOnTheScreen();
    expect(
      screen.getByText('Confira sua conexão e tente de novo.'),
    ).toBeOnTheScreen();
    const retry = screen.getByTestId('boot-error-retry');
    expect(retry).toHaveTextContent('TENTAR DE NOVO');
    expect(retry).toHaveAccessibleName('Tentar de novo');
    await fireEvent.press(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('retryTestID explícito vence o derivado', async () => {
    await renderWithTheme(
      <ErrorState
        {...base}
        retryTestID="boot-error-retry-x"
        onRetry={jest.fn()}
        retrying={false}
      />,
    );

    expect(screen.getByTestId('boot-error-retry-x')).toBeOnTheScreen();
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
});

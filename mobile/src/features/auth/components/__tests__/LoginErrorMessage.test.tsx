import { screen } from '@testing-library/react-native';
import { AccessibilityInfo, Platform } from 'react-native';

import { strings } from '../../../../constants/strings';
import { renderWithTheme } from '../../../../test/renderWithTheme';
import { LoginErrorMessage } from '../LoginErrorMessage';

const SPOKEN = 'Usuário ou senha inválida. Pode tentar novamente?';

describe('LoginErrorMessage', () => {
  let announce: jest.SpyInstance;

  beforeEach(() => {
    announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    // No preset do RN o método já é um jest.fn: o spy reaproveita o mesmo
    // mock, e as chamadas do teste anterior ficariam contadas.
    announce.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(['ios', 'android'] as const)(
    'anuncia a mensagem uma vez, sem quebra de linha, no %s',
    async os => {
      jest.replaceProperty(Platform, 'OS', os);

      await renderWithTheme(
        <LoginErrorMessage message={strings.login.error.invalid} />,
      );

      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenCalledWith(SPOKEN);
    },
  );

  it('mostra o texto em 2 linhas e lê sem a quebra', async () => {
    await renderWithTheme(
      <LoginErrorMessage message={strings.login.error.invalid} />,
    );

    const message = screen.getByTestId('login-error-message');
    expect(message).toHaveTextContent(strings.login.error.invalid);
    expect(message).toHaveProp('accessibilityLabel', SPOKEN);
  });
});

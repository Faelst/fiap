import { fireEvent, screen } from '@testing-library/react-native';
import type { ComponentProps } from 'react';
import { AccessibilityInfo } from 'react-native';

import { renderWithTheme } from '../../../test/renderWithTheme';
import { theme } from '../../../theme';
import { LogoutRow } from '../components/LogoutRow';

const { borderRadii, colors, sizes } = theme;

type Props = ComponentProps<typeof LogoutRow>;

const props = (overrides: Partial<Props> = {}): Props => ({
  testID: 'profile-logout',
  confirming: false,
  loggingOut: false,
  onAsk: jest.fn(),
  onCancel: jest.fn(),
  onConfirm: jest.fn(),
  ...overrides,
});

let focusEvent: jest.SpyInstance;

beforeEach(() => {
  focusEvent = jest
    .spyOn(AccessibilityInfo, 'sendAccessibilityEvent')
    .mockImplementation(() => {});
  // O preset do RN já mocka o AccessibilityInfo: o spyOn devolve o mesmo
  // jest.fn, então as chamadas de um teste passariam ao próximo.
  focusEvent.mockClear();
});

afterEach(() => jest.restoreAllMocks());

describe('LogoutRow', () => {
  it('em repouso: "Sair da conta" em danger, numa linha de 56', async () => {
    await renderWithTheme(<LogoutRow {...props()} />);

    const button = screen.getByTestId('profile-logout-button');
    expect(button).toHaveProp('accessibilityRole', 'button');
    expect(button).toHaveAccessibleName('Sair da conta');
    expect(screen.getByText('Sair da conta')).toHaveStyle({
      color: colors.danger,
      fontFamily: 'Montserrat-SemiBold',
    });
    expect(screen.getByTestId('profile-logout')).toHaveStyle({
      height: sizes.profile.logoutRow,
    });
    expect(screen.getByTestId('profile-logout-button-surface')).toHaveStyle({
      backgroundColor: colors.surface,
      borderRadius: borderRadii.m,
      borderColor: colors.borderSubtle,
    });
    expect(screen.queryByTestId('profile-logout-confirm')).toBeNull();
    expect(screen.queryByTestId('profile-logout-cancel')).toBeNull();
  });

  it('tocar em "Sair da conta" pede confirmação', async () => {
    const onAsk = jest.fn();
    await renderWithTheme(<LogoutRow {...props({ onAsk })} />);

    await fireEvent.press(screen.getByTestId('profile-logout-button'));

    expect(onAsk).toHaveBeenCalledTimes(1);
  });

  it('confirmando: pergunta, Cancelar e Sair no mesmo lugar', async () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    await renderWithTheme(
      <LogoutRow {...props({ confirming: true, onCancel, onConfirm })} />,
    );

    expect(screen.getByText('Sair deste aparelho?')).toBeOnTheScreen();
    expect(screen.queryByTestId('profile-logout-button')).toBeNull();
    expect(screen.getByTestId('profile-logout-cancel-surface')).toHaveStyle({
      height: sizes.pill.xs,
      backgroundColor: colors.surfaceRaised,
    });
    expect(screen.getByTestId('profile-logout-confirm-surface')).toHaveStyle({
      height: sizes.pill.xs,
      backgroundColor: colors.danger,
    });
    expect(screen.getByTestId('profile-logout')).toHaveStyle({
      height: sizes.profile.logoutRow,
    });

    await fireEvent.press(screen.getByTestId('profile-logout-cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByTestId('profile-logout-confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('saindo: Sair carregando e Cancelar desabilitado', async () => {
    await renderWithTheme(
      <LogoutRow {...props({ confirming: true, loggingOut: true })} />,
    );

    expect(screen.getByTestId('profile-logout-confirm-loading')).toBeTruthy();
    expect(screen.getByTestId('profile-logout-confirm')).toBeBusy();
    expect(screen.getByTestId('profile-logout-cancel')).toBeDisabled();
  });

  describe('foco do leitor de tela (6.4)', () => {
    it('na montagem, não mexe no foco', async () => {
      await renderWithTheme(<LogoutRow {...props()} />);

      expect(focusEvent).not.toHaveBeenCalled();
    });

    it('ao pedir confirmação o foco vai para Cancelar e, ao cancelar, volta para Sair da conta', async () => {
      const { rerender } = await renderWithTheme(<LogoutRow {...props()} />);

      await rerender(<LogoutRow {...props({ confirming: true })} />);
      expect(focusEvent).toHaveBeenLastCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({ testID: 'profile-logout-cancel' }),
        }),
        'focus',
      );

      await rerender(<LogoutRow {...props()} />);
      expect(focusEvent).toHaveBeenLastCalledWith(
        expect.objectContaining({
          props: expect.objectContaining({ testID: 'profile-logout-button' }),
        }),
        'focus',
      );
    });
  });
});

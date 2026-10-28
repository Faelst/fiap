import { screen } from '@testing-library/react-native';
import { AccessibilityInfo, Platform, StyleSheet } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { strings } from '../../../../constants/strings';
import type { RecordedAnimation } from '../../../../test/recordingAnimations';
import { renderWithTheme } from '../../../../test/renderWithTheme';
import { theme } from '../../../../theme';
import { LoginErrorBanner } from '../LoginErrorBanner';

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated/mock');
  return {
    ...actual,
    ...jest
      .requireActual('../../../../test/recordingAnimations')
      .recordingAnimations(),
    useReducedMotion: jest.fn(() => false),
  };
});

const { borderRadii, colors, sizes, spacing } = theme;
const reducedMotionMock = useReducedMotion as jest.Mock;
const MESSAGE = strings.login.error.invalid;

const entering = () =>
  (
    screen.getByTestId('login-error-banner') as unknown as {
      props: { entering?: RecordedAnimation };
    }
  ).props.entering;

describe('LoginErrorBanner', () => {
  let announce: jest.SpyInstance;

  beforeEach(() => {
    reducedMotionMock.mockReturnValue(false);
    announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    // O preset do RN já mocka o método: o spy reaproveita o mesmo jest.fn.
    announce.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('caixa de 48 em accentMuted com borda danger, raio m e o texto em `text`', async () => {
    await renderWithTheme(<LoginErrorBanner message={MESSAGE} />);

    expect(
      StyleSheet.flatten(screen.getByTestId('login-error-box').props.style),
    ).toMatchObject({
      minHeight: sizes.banner,
      borderRadius: borderRadii.m,
      backgroundColor: colors.accentMuted,
      borderColor: colors.danger,
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
    });
    const text = screen.getByTestId('login-error-message');
    expect(text).toHaveTextContent(MESSAGE);
    expect(text).toHaveStyle({ color: colors.text });
    expect(text).toHaveProp('accessibilityLabel', MESSAGE);
  });

  it.each(['ios', 'android'] as const)(
    'anuncia a mensagem uma vez no %s',
    async os => {
      jest.replaceProperty(Platform, 'OS', os);

      await renderWithTheme(<LoginErrorBanner message={MESSAGE} />);

      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenCalledWith(MESSAGE);
    },
  );

  it('entra por valor animado (sem layout animation); com reduzir movimento nasce visível', async () => {
    reducedMotionMock.mockReturnValue(true);

    await renderWithTheme(<LoginErrorBanner message={MESSAGE} />);

    // Layout animation podia deixar o banner montado e invisível no Android.
    expect(entering()).toBeUndefined();
    expect(
      StyleSheet.flatten(screen.getByTestId('login-error-banner').props.style),
    ).toMatchObject({ opacity: 1, transform: [{ translateY: 0 }] });
  });
});

import { screen } from '@testing-library/react-native';
import { AccessibilityInfo, Platform, StyleSheet } from 'react-native';
import { ReduceMotion, useReducedMotion } from 'react-native-reanimated';

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

const { borderRadii, colors, motion, sizes, spacing } = theme;
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

  it('entra com FadeInDown de 8 em base', async () => {
    await renderWithTheme(<LoginErrorBanner message={MESSAGE} />);

    expect(entering()).toMatchObject({
      name: 'FadeInDown',
      calls: {
        duration: motion.base,
        withInitialValues: {
          transform: [{ translateY: motion.enterOffsetSmall }],
        },
      },
    });
  });

  it('com reduzir movimento entra com FadeIn em fast, que o sistema não pula', async () => {
    reducedMotionMock.mockReturnValue(true);

    await renderWithTheme(<LoginErrorBanner message={MESSAGE} />);

    expect(entering()).toMatchObject({
      name: 'FadeIn',
      calls: { duration: motion.fast, reduceMotion: ReduceMotion.Never },
    });
  });
});

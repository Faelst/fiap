import { fireEvent, screen } from '@testing-library/react-native';
import type { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import {
  useReducedMotion,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { renderWithTheme } from '../../../test/renderWithTheme';
import { theme } from '../../../theme';
import { StudentRow } from '../components/StudentRow';

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated/mock');
  return {
    ...actual,
    ...jest
      .requireActual('../../../test/recordingAnimations')
      .recordingAnimations(),
    useReducedMotion: jest.fn(() => false),
    withSpring: jest.fn(actual.withSpring),
    withTiming: jest.fn(actual.withTiming),
  };
});

const { borderRadii, colors, motion, shadows, sizes, spacing } = theme;
const reducedMotionMock = useReducedMotion as jest.Mock;
const hidden = { includeHiddenElements: true };
/** Opacidade da entrada (valor animado) que envolve o elemento. */
const entranceOpacity = (id: string) =>
  StyleSheet.flatten(
    (
      screen.getByTestId(id, hidden).parent as unknown as {
        props: { style: unknown };
      }
    ).props.style as never,
  ).opacity;

type Props = ComponentProps<typeof StudentRow>;

const marina: Props = {
  testID: 'profile-student-12568',
  firstName: 'Marina',
  lastName: 'da Silva',
  fullName: 'Marina da Silva',
  rm: 12568,
  className: '3EF',
  period: 'Vespertino',
  selected: false,
  pressable: true,
  onPress: jest.fn(),
};

const row = () => screen.getByTestId('profile-student-12568');

beforeEach(() => {
  jest.clearAllMocks();
  reducedMotionMock.mockReturnValue(false);
});

describe('StudentRow', () => {
  it('avatar com as iniciais, nome e turma · RM · período', async () => {
    await renderWithTheme(<StudentRow {...marina} />);

    expect(screen.getByText('MS', hidden)).toBeTruthy();
    expect(
      screen.getByTestId('profile-student-12568-avatar', hidden),
    ).toHaveStyle({
      width: sizes.avatar.m,
      backgroundColor: colors.primaryMuted,
    });
    const name = screen.getByText('Marina da Silva', hidden);
    expect(name).toHaveProp('numberOfLines', 1);
    expect(name).toHaveStyle({
      fontFamily: 'Montserrat-SemiBold',
      fontSize: 17,
    });
    expect(screen.getByText('3EF · RM 12568 · Vespertino', hidden)).toHaveStyle(
      {
        fontSize: 12,
        color: colors.textSecondary,
      },
    );
  });

  it('linha de 72 em surfaceRaised, raio m e borda sutil', async () => {
    await renderWithTheme(<StudentRow {...marina} />);

    expect(
      screen.getByTestId('profile-student-12568-surface', hidden),
    ).toHaveStyle({
      minHeight: sizes.profile.studentRow,
      borderRadius: borderRadii.m,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      paddingHorizontal: spacing.m,
    });
  });

  it('leitor de tela: um botão com o rótulo do aluno, o estado e a dica', async () => {
    await renderWithTheme(<StudentRow {...marina} />);

    expect(row()).toHaveProp('accessibilityRole', 'button');
    expect(row()).toHaveAccessibleName(
      'Marina da Silva, turma 3EF, RM 12568, Vespertino',
    );
    expect(row()).not.toBeSelected();
    expect(row()).toHaveProp(
      'accessibilityHint',
      'Mostra as aulas e o boletim deste aluno',
    );
  });

  it('outro aluno: rádio vazio de 22, sem selo e sem destaque', async () => {
    await renderWithTheme(<StudentRow {...marina} />);

    expect(
      screen.getByTestId('profile-student-12568-radio', hidden),
    ).toHaveStyle({
      width: sizes.profile.radio,
      height: sizes.profile.radio,
      borderRadius: borderRadii.pill,
      borderWidth: sizes.profile.radioBorder,
      borderColor: colors.borderInput,
    });
    expect(
      screen.queryByTestId('profile-student-12568-current', hidden),
    ).toBeNull();
    expect(
      screen.getByTestId('profile-student-12568-highlight', hidden),
    ).toHaveStyle({
      opacity: 0,
    });
  });

  it('aluno atual: selo "Atual" e camada de borda primary com brilho, sem rádio', async () => {
    await renderWithTheme(<StudentRow {...marina} selected />);

    expect(row()).toBeSelected();
    expect(row()).not.toHaveProp('accessibilityHint');
    const badge = screen.getByTestId('profile-student-12568-current', hidden);
    expect(badge).toHaveStyle({
      height: sizes.profile.currentBadge,
      borderRadius: borderRadii.pill,
      backgroundColor: colors.primaryMuted,
    });
    expect(screen.getByText('Atual', hidden)).toHaveStyle({
      color: colors.primary,
    });
    expect(
      screen.getByTestId('profile-student-12568-highlight', hidden),
    ).toHaveStyle({
      opacity: 1,
      borderColor: colors.primary,
      borderRadius: borderRadii.m,
      boxShadow: [shadows.glowPrimary],
    });
    expect(
      screen.queryByTestId('profile-student-12568-radio', hidden),
    ).toBeNull();
  });

  it('tocar chama onPress', async () => {
    await renderWithTheme(<StudentRow {...marina} />);

    await fireEvent.press(row());

    expect(marina.onPress).toHaveBeenCalledTimes(1);
  });

  it('aluno atual com troca possível: sem papel de botão, sem toque e sem "esmaecido"', async () => {
    await renderWithTheme(<StudentRow {...marina} selected />);

    expect(row()).toHaveProp('accessibilityRole', 'text');
    expect(row()).toBeSelected();
    // Sem `disabled` (o VoiceOver leria "esmaecido"); o toque é cortado.
    expect(row()).not.toBeDisabled();
    expect(row()).toHaveProp('pointerEvents', 'none');
    await fireEvent(row(), 'pressIn');
    await fireEvent.press(row());

    expect(marina.onPress).not.toHaveBeenCalled();
    expect(withSpring).not.toHaveBeenCalled();
  });

  it('com 1 aluno: não é pressionável, sem rádio e sem dica, e fica como atual', async () => {
    await renderWithTheme(
      <StudentRow {...marina} selected pressable={false} />,
    );

    expect(row()).toHaveProp('accessibilityRole', 'text');
    expect(row()).toBeSelected();
    expect(row()).not.toHaveProp('accessibilityHint');
    expect(
      screen.getByTestId('profile-student-12568-current', hidden),
    ).toBeTruthy();
    await fireEvent.press(row());
    expect(marina.onPress).not.toHaveBeenCalled();
  });

  describe('troca de aluno (4.6)', () => {
    it('ficar atual: a camada acende em `base` e a linha vai de 0,98 a 1 com a mola pop', async () => {
      const { rerender } = await renderWithTheme(<StudentRow {...marina} />);
      expect(withSpring).not.toHaveBeenCalled();

      await rerender(<StudentRow {...marina} selected />);

      expect(withTiming).toHaveBeenCalledWith(1, { duration: motion.base });
      expect(withSpring).toHaveBeenCalledWith(1, motion.spring.pop);
      expect(
        screen.getByTestId('profile-student-12568-highlight', hidden),
      ).toHaveStyle({
        opacity: 1,
      });
    });

    it('o selo só anima numa troca: na 1ª visita entra com a tela', async () => {
      const { rerender } = await renderWithTheme(
        <StudentRow {...marina} selected />,
      );
      expect(entranceOpacity('profile-student-12568-current')).toBe(1);

      await rerender(<StudentRow {...marina} />);
      await rerender(<StudentRow {...marina} selected />);

      expect(entranceOpacity('profile-student-12568-current')).toBe(0);
    });

    it('o selo anima já na 1ª troca', async () => {
      const { rerender } = await renderWithTheme(<StudentRow {...marina} />);

      await rerender(<StudentRow {...marina} selected />);

      expect(entranceOpacity('profile-student-12568-current')).toBe(0);
    });

    it('deixar de ser atual: a camada apaga em `fast`, sem mola', async () => {
      const { rerender } = await renderWithTheme(
        <StudentRow {...marina} selected />,
      );

      await rerender(<StudentRow {...marina} />);

      expect(withTiming).toHaveBeenCalledWith(0, { duration: motion.fast });
      expect(withSpring).not.toHaveBeenCalled();
    });

    it('com reduzir movimento: o selo e o rádio ainda entram em fade (opacidade não é movimento)', async () => {
      reducedMotionMock.mockReturnValue(true);
      const { rerender } = await renderWithTheme(<StudentRow {...marina} />);

      await rerender(<StudentRow {...marina} selected />);
      expect(entranceOpacity('profile-student-12568-current')).toBe(0);

      await rerender(<StudentRow {...marina} />);
      expect(entranceOpacity('profile-student-12568-radio')).toBe(0);
    });

    it('com reduzir movimento: a camada ainda faz o fade, mas sem escala', async () => {
      reducedMotionMock.mockReturnValue(true);
      const { rerender } = await renderWithTheme(<StudentRow {...marina} />);

      await rerender(<StudentRow {...marina} selected />);

      expect(withTiming).toHaveBeenCalledWith(1, { duration: motion.base });
      expect(withSpring).not.toHaveBeenCalled();
    });
  });
});

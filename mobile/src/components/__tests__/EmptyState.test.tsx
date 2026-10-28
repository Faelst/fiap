import { screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ReduceMotion, useReducedMotion } from 'react-native-reanimated';

import type { RecordedAnimation } from '../../test/recordingAnimations';
import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { EmptyState } from '../EmptyState';
import type { IconProps } from '../icons/StrokeIcon';

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  ...jest.requireActual('../../test/recordingAnimations').recordingAnimations(),
  useReducedMotion: jest.fn(() => false),
}));

const { colors, motion, sizes } = theme;

/** Ícone falso que mostra a cor e o tamanho recebidos. */
const FakeIcon = jest.fn(({ color, size }: IconProps) => (
  <Text>{`ícone ${color} ${size}`}</Text>
));

const hidden = { includeHiddenElements: true };
const iconCircle = () => screen.getByTestId('vazio-icon', hidden);

/** O `entering` da view animada que envolve o elemento. */
const enteringOf = (node: { parent: unknown }) =>
  (node.parent as { props: { entering: RecordedAnimation } }).props.entering;

beforeEach(() => {
  FakeIcon.mockClear();
  (useReducedMotion as jest.Mock).mockReturnValue(false);
});

describe('EmptyState', () => {
  it('ícone num círculo de 64 em surfaceRaised, título e descrição', async () => {
    await renderWithTheme(
      <EmptyState
        testID="vazio"
        icon={FakeIcon}
        title="Nenhum aluno vinculado"
        description="Fale com a secretaria."
      />,
    );

    expect(screen.getByTestId('vazio')).toBeOnTheScreen();
    expect(iconCircle()).toHaveStyle({
      width: sizes.emptyIcon.circle,
      height: sizes.emptyIcon.circle,
      borderRadius: 999,
      backgroundColor: colors.surfaceRaised,
    });
    expect(
      screen.getByText(
        `ícone ${colors.textSecondary} ${sizes.emptyIcon.glyph}`,
        hidden,
      ),
    ).toBeTruthy();
    expect(screen.getByText('Nenhum aluno vinculado')).toHaveStyle({
      fontFamily: 'Montserrat-SemiBold',
      fontSize: 20,
      textAlign: 'center',
    });
    expect(screen.getByText('Fale com a secretaria.')).toHaveStyle({
      color: colors.textSecondary,
      textAlign: 'center',
    });
  });

  it('o ícone é decorativo', async () => {
    await renderWithTheme(
      <EmptyState testID="vazio" icon={FakeIcon} title="Sem aulas" />,
    );

    expect(iconCircle()).toHaveProp('accessible', false);
    expect(iconCircle()).toHaveProp(
      'importantForAccessibility',
      'no-hide-descendants',
    );
  });

  it('tom de perigo: círculo accentMuted e ícone em danger', async () => {
    await renderWithTheme(
      <EmptyState
        testID="vazio"
        icon={FakeIcon}
        tone="danger"
        title="Não foi possível carregar"
      />,
    );

    expect(iconCircle()).toHaveStyle({ backgroundColor: colors.accentMuted });
    expect(
      screen.getByText(
        `ícone ${colors.danger} ${sizes.emptyIcon.glyph}`,
        hidden,
      ),
    ).toBeTruthy();
  });

  it('mostra a ação opcional e nada quando não há descrição', async () => {
    await renderWithTheme(
      <EmptyState
        testID="vazio"
        icon={FakeIcon}
        title="Sem aulas"
        action={<Text>Ação</Text>}
      />,
    );

    expect(screen.getByText('Ação')).toBeOnTheScreen();
    expect(screen.queryByTestId('vazio-description')).toBeNull();
  });

  describe('entrada', () => {
    it('ícone: opacidade 0 → 1 e escala 0,96 → 1 em `base`', async () => {
      await renderWithTheme(
        <EmptyState testID="vazio" icon={FakeIcon} title="Sem aulas" />,
      );

      const entering = enteringOf(iconCircle());
      expect(entering.name).toBe('Keyframe');
      expect(entering.keyframes).toEqual({
        0: { opacity: 0, transform: [{ scale: motion.illustrationScaleFrom }] },
        100: { opacity: 1, transform: [{ scale: 1 }], easing: motion.easeOut },
      });
      expect(entering.calls.duration).toBe(motion.base);
      expect(entering.calls.reduceMotion).toBe(ReduceMotion.System);
    });

    it('título, descrição e ação entram em cascata depois do ícone', async () => {
      await renderWithTheme(
        <EmptyState
          testID="vazio"
          icon={FakeIcon}
          title="Sem aulas"
          description="Descrição"
          action={<Text>Ação</Text>}
        />,
      );

      const delays = ['Sem aulas', 'Descrição', 'Ação'].map(
        text => enteringOf(screen.getByText(text)).calls.delay,
      );
      expect(delays).toEqual([
        motion.stagger,
        2 * motion.stagger,
        3 * motion.stagger,
      ]);
      expect(enteringOf(screen.getByText('Sem aulas')).name).toBe('FadeInDown');
    });

    it('com reduzir movimento: só fade, que o sistema não pula', async () => {
      (useReducedMotion as jest.Mock).mockReturnValue(true);
      await renderWithTheme(
        <EmptyState
          testID="vazio"
          icon={FakeIcon}
          title="Sem aulas"
          description="Descrição"
        />,
      );

      for (const entering of [
        enteringOf(iconCircle()),
        enteringOf(screen.getByText('Sem aulas')),
        enteringOf(screen.getByText('Descrição')),
      ]) {
        expect(entering.name).toBe('FadeIn');
        expect(entering.calls.reduceMotion).toBe(ReduceMotion.Never);
      }
    });
  });
});

import { screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ReduceMotion, useReducedMotion } from 'react-native-reanimated';

import type { RecordedAnimation } from '../../test/recordingAnimations';
import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { EmptyState } from '../EmptyState';

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  ...jest.requireActual('../../test/recordingAnimations').recordingAnimations(),
  useReducedMotion: jest.fn(() => false),
}));

const { motion } = theme;

/** O `entering` da view animada que envolve o elemento. */
const enteringOf = (node: { parent: unknown }) =>
  (node.parent as { props: { entering: RecordedAnimation } }).props.entering;

const illustrationEntering = () =>
  enteringOf(
    screen.getByTestId('vazio-illustration', { includeHiddenElements: true }),
  );

describe('EmptyState', () => {
  it('ilustração decorativa no tamanho do tema, título, descrição e ação', async () => {
    await renderWithTheme(
      <EmptyState
        testID="vazio"
        title="Nenhum aluno vinculado"
        description="Fale com a secretaria."
        action={<Text>ação</Text>}
      />,
    );

    expect(screen.getByTestId('vazio')).toBeOnTheScreen();
    expect(screen.getByText('Nenhum aluno vinculado')).toBeOnTheScreen();
    expect(screen.getByText('Fale com a secretaria.')).toBeOnTheScreen();
    expect(screen.getByText('ação')).toBeOnTheScreen();
    const illustration = screen.getByTestId('vazio-illustration', {
      includeHiddenElements: true,
    });
    expect(illustration).toHaveStyle(theme.sizes.illustration);
    expect(illustration).toHaveProp('accessible', false);
  });

  it('sem ilustração quando pedido', async () => {
    await renderWithTheme(
      <EmptyState testID="vazio" title="Sem aulas" illustration={false} />,
    );

    expect(
      screen.queryByTestId('vazio-illustration', {
        includeHiddenElements: true,
      }),
    ).toBeNull();
  });

  describe('entrada (01-design.md, 4.5)', () => {
    beforeEach(() => {
      (useReducedMotion as jest.Mock).mockReturnValue(false);
    });

    it('ilustração: opacidade 0 → 1 e escala 0,96 → 1 em `base`', async () => {
      await renderWithTheme(<EmptyState testID="vazio" title="Sem aulas" />);

      const entering = illustrationEntering();
      expect(entering.name).toBe('Keyframe');
      expect(entering.keyframes).toEqual({
        0: { opacity: 0, transform: [{ scale: 0.96 }] },
        100: { opacity: 1, transform: [{ scale: 1 }], easing: motion.easeOut },
      });
      expect(entering.calls.duration).toBe(motion.base);
      expect(entering.calls.reduceMotion).toBe(ReduceMotion.System);
    });

    it('com ilustração, o título espera um stagger e o resto vem em seguida', async () => {
      await renderWithTheme(
        <EmptyState
          testID="vazio"
          title="Sem aulas"
          description="Descrição"
          action={<Text>ação</Text>}
        />,
      );

      const title = enteringOf(screen.getByText('Sem aulas'));
      expect(title.name).toBe('FadeInDown');
      expect(title.calls.delay).toBe(motion.stagger);
      expect(enteringOf(screen.getByText('Descrição')).calls.delay).toBe(
        2 * motion.stagger,
      );
      expect(enteringOf(screen.getByText('ação')).calls.delay).toBe(
        3 * motion.stagger,
      );
    });

    it('sem ilustração, o título entra sem atraso (4.8)', async () => {
      await renderWithTheme(
        <EmptyState testID="vazio" title="Sem boletim" illustration={false} />,
      );

      expect(enteringOf(screen.getByText('Sem boletim')).calls.delay).toBe(0);
    });

    it('com reduzir movimento: só fade, que o sistema não pula', async () => {
      (useReducedMotion as jest.Mock).mockReturnValue(true);
      await renderWithTheme(
        <EmptyState testID="vazio" title="Sem aulas" description="Descrição" />,
      );

      const illustration = illustrationEntering();
      expect(illustration.name).toBe('FadeIn');
      expect(illustration.calls.duration).toBe(motion.base);
      expect(illustration.calls.reduceMotion).toBe(ReduceMotion.Never);
      for (const text of ['Sem aulas', 'Descrição']) {
        const entering = enteringOf(screen.getByText(text));
        expect(entering.name).toBe('FadeIn');
        expect(entering.calls.reduceMotion).toBe(ReduceMotion.Never);
      }
    });
  });
});

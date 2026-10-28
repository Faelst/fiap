import { fireEvent, screen } from '@testing-library/react-native';
import type { ComponentProps } from 'react';
import { useReducedMotion, type SharedValue } from 'react-native-reanimated';

import type { RecordedAnimation } from '../../test/recordingAnimations';
import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { CompactHeader } from '../CompactHeader';

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  ...jest.requireActual('../../test/recordingAnimations').recordingAnimations(),
  useReducedMotion: jest.fn(() => false),
}));

const { colors, motion, sizes, spacing } = theme;
const reducedMotionMock = useReducedMotion as jest.Mock;

type Props = ComponentProps<typeof CompactHeader>;

const rafael = {
  id: 's1',
  firstName: 'Rafael',
  lastName: 'da Silva',
  className: '7EF',
  rm: 12567,
  period: 'Matutino',
};

const props = (overrides: Partial<Props> = {}): Props => ({
  title: 'Agenda',
  titleTestID: 'agenda-title',
  guardianFirstName: 'Gustavo',
  student: rafael,
  onPressStudent: jest.fn(),
  ...overrides,
});

/** Shared value parado na posição de rolagem dada. */
const scrolledTo = (y: number) =>
  ({ value: y, get: () => y } as unknown as SharedValue<number>);

const enteringOf = (testID: string) =>
  (
    screen.getByTestId(testID) as unknown as {
      props: { entering?: RecordedAnimation };
    }
  ).props.entering;

beforeEach(() => {
  jest.clearAllMocks();
  reducedMotionMock.mockReturnValue(false);
});

describe('CompactHeader', () => {
  it('linha do logo de 56: logo 80 × 13 com rótulo e o chip do aluno', async () => {
    await renderWithTheme(<CompactHeader {...props()} />);

    expect(screen.getByTestId('header')).toBeOnTheScreen();
    expect(screen.getByTestId('header-bar')).toHaveStyle({
      height: sizes.headerBar,
      paddingHorizontal: spacing.m,
    });
    const logo = screen.getByLabelText('FIAP School');
    expect(logo).toHaveProp('accessibilityRole', 'image');
    expect(logo).toHaveStyle(sizes.logoHeader);
    expect(screen.getByTestId('header-student-chip')).toHaveAccessibleName(
      'Aluno Rafael, turma 7EF, RM 12567, período Matutino',
    );
  });

  it('saudação em caixa normal e o título grande, os dois como cabeçalho', async () => {
    await renderWithTheme(<CompactHeader {...props()} />);

    const greeting = screen.getByTestId('header-greeting');
    expect(greeting).toHaveTextContent('Olá, Gustavo');
    expect(greeting).toHaveProp('accessibilityRole', 'header');
    expect(greeting).toHaveStyle({ color: colors.textSecondary, fontSize: 13 });
    const title = screen.getByTestId('agenda-title');
    expect(title).toHaveTextContent('Agenda');
    expect(title).toHaveProp('accessibilityRole', 'header');
    expect(title).toHaveStyle({ fontFamily: 'Montserrat-Bold' });
  });

  it('tocar no chip chama onPressStudent', async () => {
    const onPressStudent = jest.fn();
    await renderWithTheme(<CompactHeader {...props({ onPressStudent })} />);

    await fireEvent.press(screen.getByTestId('header-student-chip'));

    expect(onPressStudent).toHaveBeenCalledTimes(1);
  });

  it('sem chip no Perfil (showChip false) e quando não há aluno', async () => {
    const { rerender } = await renderWithTheme(
      <CompactHeader {...props({ showChip: false })} />,
    );
    expect(screen.queryByTestId('header-student-chip')).toBeNull();

    await rerender(<CompactHeader {...props({ student: null })} />);
    expect(screen.queryByTestId('header-student-chip')).toBeNull();
  });

  it('sem saudação quando não há responsável (BootError)', async () => {
    await renderWithTheme(
      <CompactHeader
        {...props({ guardianFirstName: undefined, student: null })}
      />,
    );

    expect(screen.queryByTestId('header-greeting')).toBeNull();
    expect(screen.getByTestId('agenda-title')).toBeOnTheScreen();
  });

  describe('divisória de baixo (opacidade pela rolagem)', () => {
    it('sem rolagem, fica apagada', async () => {
      await renderWithTheme(<CompactHeader {...props()} />);

      expect(screen.getByTestId('header-divider')).toHaveStyle({
        opacity: 0,
        backgroundColor: colors.borderSubtle,
      });
    });

    it('acende de 0 a 1 nos primeiros `m` de rolagem', async () => {
      const { rerender } = await renderWithTheme(
        <CompactHeader {...props({ scrollY: scrolledTo(spacing.m / 2) })} />,
      );
      expect(screen.getByTestId('header-divider')).toHaveStyle({
        opacity: 0.5,
      });

      await rerender(
        <CompactHeader {...props({ scrollY: scrolledTo(spacing.m * 3) })} />,
      );
      expect(screen.getByTestId('header-divider')).toHaveStyle({
        opacity: 1,
      });

      await rerender(
        <CompactHeader {...props({ scrollY: scrolledTo(-40) })} />,
      );
      expect(screen.getByTestId('header-divider')).toHaveStyle({
        opacity: 0,
      });
    });
  });

  describe('entrada (4.3)', () => {
    it('linha do logo em fade; saudação e título descem um `stagger` depois', async () => {
      await renderWithTheme(<CompactHeader {...props()} />);

      expect(enteringOf('header-bar-enter')).toMatchObject({
        name: 'FadeIn',
        calls: { duration: motion.base },
      });
      expect(enteringOf('header-titles-enter')).toMatchObject({
        name: 'FadeInDown',
        calls: { duration: motion.base, delay: motion.stagger },
      });
    });

    it('com reduzir movimento, tudo em fade curto, sem atraso', async () => {
      reducedMotionMock.mockReturnValue(true);
      await renderWithTheme(<CompactHeader {...props()} />);

      for (const id of ['header-bar-enter', 'header-titles-enter']) {
        expect(enteringOf(id)).toMatchObject({
          name: 'FadeIn',
          calls: { duration: motion.fast, reduceMotion: 'never' },
        });
        expect(enteringOf(id)?.calls.delay).toBeUndefined();
      }
    });
  });
});

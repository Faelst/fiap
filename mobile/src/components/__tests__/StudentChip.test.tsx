import { fireEvent, screen } from '@testing-library/react-native';
import { useReducedMotion, withSpring } from 'react-native-reanimated';

import type { RecordedAnimation } from '../../test/recordingAnimations';
import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { StudentChip, type ChipStudent } from '../StudentChip';

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated/mock');
  return {
    ...actual,
    ...jest
      .requireActual('../../test/recordingAnimations')
      .recordingAnimations(),
    useReducedMotion: jest.fn(() => false),
    withSpring: jest.fn(actual.withSpring),
  };
});

const { borderRadii, colors, motion, sizes } = theme;
const reducedMotionMock = useReducedMotion as jest.Mock;
// O chip é um elemento só para o leitor de tela: os filhos ficam ocultos.
const hidden = { includeHiddenElements: true };

const rafael: ChipStudent = {
  id: 's1',
  firstName: 'Rafael',
  lastName: 'da Silva',
  className: '7EF',
  rm: 12567,
  period: 'Matutino',
};

const marina: ChipStudent = {
  id: 's2',
  firstName: 'Marina',
  lastName: 'da Silva',
  className: '3EF',
  rm: 12568,
  period: 'Vespertino',
};

const chip = () => screen.getByTestId('header-student-chip');
const contentEntering = () =>
  (
    screen.getByTestId('header-student-chip-content', hidden) as unknown as {
      props: { entering?: RecordedAnimation };
    }
  ).props.entering;

beforeEach(() => {
  jest.clearAllMocks();
  reducedMotionMock.mockReturnValue(false);
});

describe('StudentChip', () => {
  it('avatar de iniciais, primeiro nome e turma', async () => {
    await renderWithTheme(<StudentChip student={rafael} onPress={jest.fn()} />);

    expect(screen.getByText('RS', hidden)).toBeTruthy();
    expect(
      screen.getByTestId('header-student-chip-avatar', hidden),
    ).toHaveStyle({ width: sizes.studentChip.avatar });
    const name = screen.getByTestId('header-student-name', hidden);
    expect(name).toHaveTextContent('Rafael');
    expect(name).toHaveProp('numberOfLines', 1);
    expect(name).toHaveStyle({ fontFamily: 'Montserrat-SemiBold' });
    const className = screen.getByTestId('header-student-class', hidden);
    expect(className).toHaveTextContent('7EF');
    expect(className).toHaveStyle({ color: colors.textSecondary });
    expect(screen.getByText('·', hidden)).toBeTruthy();
  });

  it('pílula de 40 em surfaceRaised com borda sutil e largura até 200', async () => {
    await renderWithTheme(<StudentChip student={rafael} onPress={jest.fn()} />);

    expect(
      screen.getByTestId('header-student-chip-surface', hidden),
    ).toHaveStyle({
      height: sizes.studentChip.height,
      maxWidth: sizes.studentChip.maxWidth,
      borderRadius: borderRadii.pill,
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.borderSubtle,
    });
  });

  it('leitor de tela: botão com o rótulo do aluno da v1 e a dica "Abre o perfil"', async () => {
    await renderWithTheme(<StudentChip student={rafael} onPress={jest.fn()} />);

    expect(chip()).toHaveProp('accessibilityRole', 'button');
    expect(chip()).toHaveAccessibleName(
      'Aluno Rafael, turma 7EF, RM 12567, período Matutino',
    );
    expect(chip()).toHaveProp('accessibilityHint', 'Abre o perfil');
  });

  it('tocar chama onPress e encolhe com pressScaleSmall', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<StudentChip student={rafael} onPress={onPress} />);

    await fireEvent(chip(), 'pressIn');
    await fireEvent.press(chip());

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(withSpring).toHaveBeenCalledWith(
      motion.pressScaleSmall,
      motion.press,
    );
  });

  it('com reduzir movimento, o toque não escala', async () => {
    reducedMotionMock.mockReturnValue(true);
    await renderWithTheme(<StudentChip student={rafael} onPress={jest.fn()} />);

    await fireEvent(chip(), 'pressIn');

    expect(withSpring).not.toHaveBeenCalled();
  });

  it('o 1º aluno entra com o header; trocar de aluno faz crossfade do conteúdo', async () => {
    const { rerender } = await renderWithTheme(
      <StudentChip student={rafael} onPress={jest.fn()} />,
    );
    expect(contentEntering()).toBeUndefined();

    await rerender(<StudentChip student={marina} onPress={jest.fn()} />);

    expect(screen.getByTestId('header-student-name', hidden)).toHaveTextContent(
      'Marina',
    );
    expect(chip()).toHaveAccessibleName(
      'Aluno Marina, turma 3EF, RM 12568, período Vespertino',
    );
    expect(contentEntering()).toMatchObject({
      name: 'FadeIn',
      calls: { duration: motion.base, reduceMotion: 'never' },
    });
  });
});

import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { StudentCard } from '../StudentCard';

const props = {
  fullName: 'Rafael da Silva',
  rm: 12567,
  className: '7EF',
  period: 'Matutino',
  testID: 'select-student-card-12567',
};

describe('StudentCard', () => {
  it('mostra nome completo e a linha turma - RM - período', async () => {
    await renderWithTheme(
      <StudentCard {...props} selected={false} onPress={jest.fn()} />,
    );

    expect(screen.getByText('Rafael da Silva')).toHaveStyle({
      textTransform: 'uppercase',
    });
    expect(screen.getByText('7EF - RM 12567 - Matutino')).toBeOnTheScreen();
    expect(
      screen.getByTestId('select-student-card-12567'),
    ).toHaveAccessibleName('Rafael da Silva, turma 7EF, RM 12567, Matutino');
  });

  it('selecionado: borda primary e estado selected para o leitor', async () => {
    await renderWithTheme(
      <StudentCard {...props} selected onPress={jest.fn()} />,
    );

    const card = screen.getByTestId('select-student-card-12567');
    expect(card).toBeSelected();
    expect(screen.getByTestId('select-student-card-12567-box')).toHaveStyle({
      borderColor: theme.colors.primary,
      borderWidth: 1,
    });
  });

  it('não selecionado: borda transparente (sem pulo de layout)', async () => {
    await renderWithTheme(
      <StudentCard {...props} selected={false} onPress={jest.fn()} />,
    );

    expect(screen.getByTestId('select-student-card-12567')).not.toBeSelected();
    expect(screen.getByTestId('select-student-card-12567-box')).toHaveStyle({
      borderColor: 'transparent',
      borderWidth: 1,
    });
  });

  it('toque chama onPress', async () => {
    const onPress = jest.fn();
    await renderWithTheme(
      <StudentCard {...props} selected={false} onPress={onPress} />,
    );

    await fireEvent.press(screen.getByTestId('select-student-card-12567'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

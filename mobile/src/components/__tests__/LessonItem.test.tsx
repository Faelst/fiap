import { screen } from '@testing-library/react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { LessonItem } from '../LessonItem';

describe('LessonItem', () => {
  const renderItem = () =>
    renderWithTheme(
      <LessonItem
        testID="agenda-lesson-0"
        index={0}
        startTime="07:15"
        endTime="08:00"
        subject="Matemática I"
      />,
    );

  it('mostra o horário "início - fim" e a disciplina, com os testIDs derivados', async () => {
    await renderItem();

    expect(screen.getByTestId('agenda-lesson-0-time')).toHaveTextContent(
      '07:15 - 08:00',
    );
    expect(screen.getByTestId('agenda-lesson-0-subject')).toHaveTextContent(
      'Matemática I',
    );
  });

  it('é um elemento só para o leitor de tela: "Das 07:15 às 08:00, Matemática I"', async () => {
    await renderItem();

    const item = screen.getByTestId('agenda-lesson-0');
    expect(item).toHaveProp('accessible', true);
    expect(item).toHaveAccessibleName('Das 07:15 às 08:00, Matemática I');
  });

  it('bolinha vazada de 6 com borda bulletBorder, numa coluna de 16', async () => {
    await renderItem();

    expect(screen.getByTestId('agenda-lesson-0-bullet')).toHaveStyle({
      width: theme.sizes.bullet,
      height: theme.sizes.bullet,
      borderWidth: 1,
      borderColor: theme.colors.bulletBorder,
    });
    expect(screen.getByTestId('agenda-lesson-0-bullet-slot')).toHaveStyle({
      width: theme.sizes.bulletSlot,
    });
  });

  it('disciplina longa quebra em até 2 linhas', async () => {
    await renderItem();

    expect(screen.getByTestId('agenda-lesson-0-subject')).toHaveProp(
      'numberOfLines',
      2,
    );
  });
});

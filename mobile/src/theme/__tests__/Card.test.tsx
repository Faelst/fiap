import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@shopify/restyle';
import { StyleSheet } from 'react-native';

import { Card, theme } from '..';

const renderCard = (variant: 'student' | 'studentSelected') =>
  render(
    <ThemeProvider theme={theme}>
      <Card testID="card" variant={variant} />
    </ThemeProvider>,
  );

describe('Card', () => {
  it('destaca o aluno atual com borda primary na variante studentSelected', async () => {
    await renderCard('studentSelected');

    const style = StyleSheet.flatten(screen.getByTestId('card').props.style);

    expect(style).toMatchObject({
      backgroundColor: '#4D4D4D',
      borderColor: '#29F4D5',
      borderWidth: 1,
      borderRadius: 8,
      height: 90,
    });
  });

  it('mantém a borda transparente no aluno não selecionado para não pular o layout', async () => {
    await renderCard('student');

    const style = StyleSheet.flatten(screen.getByTestId('card').props.style);

    expect(style).toMatchObject({ borderColor: 'transparent', borderWidth: 1 });
  });
});

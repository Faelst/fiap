import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@shopify/restyle';
import { StyleSheet } from 'react-native';

import { Card, theme } from '..';

const renderCard = (variant: 'student') =>
  render(
    <ThemeProvider theme={theme}>
      <Card testID="card" variant={variant} />
    </ThemeProvider>,
  );

describe('Card', () => {
  it('mantém a borda transparente no aluno não selecionado para não pular o layout', async () => {
    await renderCard('student');

    const style = StyleSheet.flatten(screen.getByTestId('card').props.style);

    expect(style).toMatchObject({ borderColor: 'transparent', borderWidth: 1 });
  });
});

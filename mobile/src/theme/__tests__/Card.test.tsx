import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@shopify/restyle';
import { StyleSheet } from 'react-native';

import { Card, theme } from '..';

const styleOf = async (
  variant: Exclude<keyof typeof theme.cardVariants, 'defaults'>,
) => {
  await render(
    <ThemeProvider theme={theme}>
      <Card testID="card" variant={variant} />
    </ThemeProvider>,
  );
  return StyleSheet.flatten(screen.getByTestId('card').props.style);
};

describe('Card', () => {
  it('surface: fundo surface, borda sutil de 1, raio l e padding l', async () => {
    expect(await styleOf('surface')).toMatchObject({
      backgroundColor: '#141414',
      borderColor: '#262626',
      borderWidth: 1,
      borderRadius: 20,
      padding: 24,
    });
  });

  it('lesson: surfaceRaised, raio s e padding sm × s', async () => {
    expect(await styleOf('lesson')).toMatchObject({
      backgroundColor: '#1E1E1E',
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
    });
  });

  it('floating: pílula com borda forte', async () => {
    expect(await styleOf('floating')).toMatchObject({
      backgroundColor: '#1E1E1E',
      borderColor: '#3A3A3A',
      borderWidth: 1,
      borderRadius: 999,
    });
  });
});

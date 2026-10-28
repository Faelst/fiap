import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@shopify/restyle';
import { StyleSheet } from 'react-native';

import { Text, theme } from '..';

describe('Text', () => {
  it('aplica cor primary, Montserrat Bold e tamanho 20 na variante sectionTitle', async () => {
    await render(
      <ThemeProvider theme={theme}>
        <Text variant="sectionTitle">AGENDA</Text>
      </ThemeProvider>,
    );

    const style = StyleSheet.flatten(screen.getByText('AGENDA').props.style);

    expect(style).toMatchObject({
      color: '#29F4D5',
      fontFamily: 'Montserrat-Bold',
      fontSize: 20,
    });
  });
});

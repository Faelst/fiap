import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@shopify/restyle';
import { StyleSheet } from 'react-native';

import { Text, theme } from '..';

const styleOf = async (
  variant: Exclude<keyof typeof theme.textVariants, 'defaults'>,
  text: string,
) => {
  await render(
    <ThemeProvider theme={theme}>
      <Text variant={variant}>{text}</Text>
    </ThemeProvider>,
  );
  return StyleSheet.flatten(screen.getByText(text).props.style);
};

describe('Text', () => {
  it('body da v2: Montserrat Regular 15/22 em text', async () => {
    expect(await styleOf('body', 'Corpo')).toMatchObject({
      color: '#FFFFFF',
      fontFamily: 'Montserrat-Regular',
      fontSize: 15,
      lineHeight: 22,
    });
  });

  it('overline: SemiBold 11 em textTertiary, caixa alta e espaçado', async () => {
    expect(await styleOf('overline', 'Alunos')).toMatchObject({
      color: '#8C8C8C',
      fontFamily: 'Montserrat-SemiBold',
      fontSize: 11,
      lineHeight: 14,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    });
  });

  it('números (grade) usam dígitos tabulares', async () => {
    expect(await styleOf('grade', '8,5')).toMatchObject({
      fontFamily: 'Montserrat-Bold',
      fontSize: 24,
      fontVariant: ['tabular-nums'],
    });
  });

  it('button sai da caixa alta e fica em textOnPrimary', async () => {
    const style = await styleOf('button', 'Entrar');
    expect(style).toMatchObject({
      color: '#000000',
      fontFamily: 'Montserrat-SemiBold',
      fontSize: 16,
    });
    expect(style.textTransform).toBeUndefined();
  });

  it('error usa danger (rosa claro), não o teal', async () => {
    expect(await styleOf('error', 'Erro')).toMatchObject({
      color: '#FF5C8D',
      fontSize: 13,
    });
  });
});

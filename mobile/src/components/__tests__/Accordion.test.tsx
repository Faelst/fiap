import { ThemeProvider } from '@shopify/restyle';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { Text } from 'react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { Accordion } from '../Accordion';

describe('Accordion', () => {
  const onToggle = jest.fn();
  const renderBody = jest.fn(() => <Text>Nota: 9,5</Text>);

  beforeEach(() => {
    onToggle.mockClear();
    renderBody.mockClear();
  });

  const accordion = (expanded: boolean) => (
    <Accordion
      testID="boletim-term-1"
      accessibilityLabel="1º trimestre"
      expanded={expanded}
      onToggle={onToggle}
      renderHeader={chevron => (
        <>
          <Text>1º TRIMESTRE</Text>
          {chevron}
        </>
      )}
    >
      {renderBody()}
    </Accordion>
  );

  it('fechado: cabeçalho é um botão recolhido e o corpo não é montado', async () => {
    await renderWithTheme(accordion(false));

    const header = screen.getByTestId('boletim-term-1');
    expect(header).toHaveTextContent('1º TRIMESTRE');
    expect(header).toHaveAccessibleName('1º trimestre');
    expect(header).toHaveProp('accessibilityRole', 'button');
    expect(header).not.toBeExpanded();
    expect(
      screen.queryByTestId('boletim-term-1-content', {
        includeHiddenElements: true,
      }),
    ).toBeNull();
    expect(screen.queryByText('Nota: 9,5')).toBeNull();
  });

  it('o cabeçalho tem alvo de toque ≥ 44 no próprio Pressable', async () => {
    await renderWithTheme(accordion(false));

    expect(screen.getByTestId('boletim-term-1')).toHaveStyle({
      minHeight: theme.sizes.touchTarget,
    });
  });

  it('tocar no cabeçalho chama onToggle', async () => {
    await renderWithTheme(accordion(false));

    await fireEvent.press(screen.getByTestId('boletim-term-1'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('aberto: expandido, com o corpo montado e visível', async () => {
    await renderWithTheme(accordion(true));

    expect(screen.getByTestId('boletim-term-1')).toBeExpanded();
    expect(screen.getByTestId('boletim-term-1-content')).toBeOnTheScreen();
    expect(screen.getByText('Nota: 9,5')).toBeOnTheScreen();
  });

  it('o corpo é montado na 1ª abertura e continua montado, escondido do leitor, ao fechar', async () => {
    // `wrapper`: o `rerender` mantém o tema.
    const { rerender } = await render(accordion(false), {
      wrapper: ({ children }: PropsWithChildren) => (
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      ),
    });
    expect(
      screen.queryByTestId('boletim-term-1-content', {
        includeHiddenElements: true,
      }),
    ).toBeNull();

    await rerender(accordion(true));
    expect(screen.getByTestId('boletim-term-1-content')).toBeOnTheScreen();

    await rerender(accordion(false));
    expect(screen.getByTestId('boletim-term-1')).not.toBeExpanded();
    expect(screen.queryByTestId('boletim-term-1-content')).toBeNull();
    expect(
      screen.getByTestId('boletim-term-1-content', {
        includeHiddenElements: true,
      }),
    ).toBeOnTheScreen();
  });

  it('o corpo corta o que passa da altura animada', async () => {
    await renderWithTheme(accordion(true));

    expect(screen.getByTestId('boletim-term-1-content')).toHaveStyle({
      overflow: 'hidden',
    });
  });
});

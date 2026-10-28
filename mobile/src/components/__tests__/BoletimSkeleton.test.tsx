import { screen } from '@testing-library/react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { BoletimSkeleton } from '../BoletimSkeleton';

describe('BoletimSkeleton', () => {
  it('é um progressbar "Carregando boletim" com os blocos escondidos do leitor', async () => {
    await renderWithTheme(<BoletimSkeleton testID="boletim-skeleton" />);

    const skeleton = screen.getByTestId('boletim-skeleton');
    expect(skeleton).toHaveProp('accessibilityRole', 'progressbar');
    expect(skeleton).toHaveAccessibleName('Carregando boletim');
    expect(
      screen.getByTestId('boletim-skeleton-blocks', {
        includeHiddenElements: true,
      }),
    ).toHaveProp('importantForAccessibility', 'no-hide-descendants');
  });

  it('um bloco do tamanho do dropdown e 3 cards de trimestre', async () => {
    await renderWithTheme(<BoletimSkeleton testID="boletim-skeleton" />);

    expect(
      screen.getByTestId('boletim-skeleton-dropdown', {
        includeHiddenElements: true,
      }),
    ).toHaveStyle({
      height: theme.sizes.dropdown,
      backgroundColor: theme.colors.surfaceHigh,
    });
    const terms = screen.getAllByTestId(/^boletim-skeleton-term-\d$/, {
      includeHiddenElements: true,
    });
    expect(terms).toHaveLength(3);
    expect(terms[0]).toHaveStyle({ height: theme.sizes.termCard });
  });

  it('na troca de ano, só os cards (o dropdown fica na tela)', async () => {
    await renderWithTheme(
      <BoletimSkeleton testID="boletim-skeleton" withDropdown={false} />,
    );

    expect(
      screen.queryByTestId('boletim-skeleton-dropdown', {
        includeHiddenElements: true,
      }),
    ).toBeNull();
    expect(
      screen.getAllByTestId(/^boletim-skeleton-term-\d$/, {
        includeHiddenElements: true,
      }),
    ).toHaveLength(3);
  });
});

import { screen } from '@testing-library/react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { AgendaSkeleton } from '../AgendaSkeleton';

describe('AgendaSkeleton', () => {
  it('é um progressbar "Carregando agenda" com os blocos escondidos do leitor', async () => {
    await renderWithTheme(<AgendaSkeleton testID="agenda-skeleton" />);

    const skeleton = screen.getByTestId('agenda-skeleton');
    expect(skeleton).toHaveProp('accessibilityRole', 'progressbar');
    expect(skeleton).toHaveAccessibleName('Carregando agenda');
    // Android: `no-hide-descendants` esconde a própria view; fica num wrapper
    // interno, e o container continua anunciado.
    expect(
      screen.getByTestId('agenda-skeleton-blocks', {
        includeHiddenElements: true,
      }),
    ).toHaveProp('importantForAccessibility', 'no-hide-descendants');
  });

  it('um bloco do tamanho do dropdown e 4 linhas no formato da aula', async () => {
    await renderWithTheme(<AgendaSkeleton testID="agenda-skeleton" />);

    expect(
      screen.getByTestId('agenda-skeleton-dropdown', {
        includeHiddenElements: true,
      }),
    ).toHaveStyle({
      height: theme.sizes.dropdown,
      backgroundColor: theme.colors.surfaceHigh,
    });
    expect(
      screen.getAllByTestId(/^agenda-skeleton-row-\d$/, {
        includeHiddenElements: true,
      }),
    ).toHaveLength(4);
  });
});

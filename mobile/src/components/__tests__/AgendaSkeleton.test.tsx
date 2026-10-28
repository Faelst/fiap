import { screen } from '@testing-library/react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { AgendaSkeleton } from '../AgendaSkeleton';

describe('AgendaSkeleton', () => {
  it('é um progressbar "Carregando agenda" com os blocos escondidos do leitor', async () => {
    await renderWithTheme(<AgendaSkeleton testID="agenda-skeleton" />);

    const skeleton = screen.getByTestId('agenda-skeleton');
    expect(skeleton).toHaveProp('accessibilityRole', 'progressbar');
    expect(skeleton).toHaveAccessibleName('Carregando agenda…');
    // Android: `no-hide-descendants` esconde a própria view; fica num wrapper
    // interno, e o container continua anunciado.
    expect(
      screen.getByTestId('agenda-skeleton-blocks', {
        includeHiddenElements: true,
      }),
    ).toHaveProp('importantForAccessibility', 'no-hide-descendants');
  });

  it('a faixa com 7 chips e 4 blocos de aula', async () => {
    await renderWithTheme(<AgendaSkeleton testID="agenda-skeleton" />);

    expect(
      screen.getByTestId('agenda-skeleton-days', {
        includeHiddenElements: true,
      }).children,
    ).toHaveLength(7);
    expect(
      screen.getAllByTestId(/^agenda-skeleton-row-\d$/, {
        includeHiddenElements: true,
      }),
    ).toHaveLength(4);
  });
});

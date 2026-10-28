import { screen } from '@testing-library/react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { BoletimSkeleton } from '../BoletimSkeleton';

describe('BoletimSkeleton', () => {
  it('é um progressbar "Carregando boletim" com os blocos escondidos do leitor', async () => {
    await renderWithTheme(<BoletimSkeleton testID="boletim-skeleton" />);

    const skeleton = screen.getByTestId('boletim-skeleton');
    expect(skeleton).toHaveProp('accessibilityRole', 'progressbar');
    expect(skeleton).toHaveAccessibleName('Carregando boletim…');
    expect(
      screen.getByTestId('boletim-skeleton-blocks', {
        includeHiddenElements: true,
      }),
    ).toHaveProp('importantForAccessibility', 'no-hide-descendants');
  });

  it('segmento de ano, de trimestre, o resumo e 4 cards de disciplina', async () => {
    await renderWithTheme(<BoletimSkeleton testID="boletim-skeleton" />);

    const hidden = { includeHiddenElements: true };
    expect(screen.getByTestId('boletim-skeleton-year', hidden)).toHaveStyle({
      height: theme.sizes.segmented.sm,
      backgroundColor: theme.colors.surfaceHigh,
    });
    expect(screen.getByTestId('boletim-skeleton-term', hidden)).toHaveStyle({
      height: theme.sizes.segmented.md,
    });
    expect(screen.getByTestId('boletim-skeleton-summary', hidden)).toHaveStyle({
      height: theme.sizes.reportCard.skeletonSummary,
    });
    expect(
      screen.getAllByTestId(/^boletim-skeleton-subject-\d$/, hidden),
    ).toHaveLength(4);
  });

  it('na troca de ano, sem o segmento de ano (o real fica na tela)', async () => {
    await renderWithTheme(
      <BoletimSkeleton testID="boletim-skeleton" withYear={false} />,
    );

    expect(
      screen.queryByTestId('boletim-skeleton-year', {
        includeHiddenElements: true,
      }),
    ).toBeNull();
    expect(
      screen.getByTestId('boletim-skeleton-term', {
        includeHiddenElements: true,
      }),
    ).toBeOnTheScreen();
  });
});

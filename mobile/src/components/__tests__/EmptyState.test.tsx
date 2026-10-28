import { screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('ilustração decorativa no tamanho do tema, título, descrição e ação', async () => {
    await renderWithTheme(
      <EmptyState
        testID="vazio"
        title="Nenhum aluno vinculado"
        description="Fale com a secretaria."
        action={<Text>ação</Text>}
      />,
    );

    expect(screen.getByTestId('vazio')).toBeOnTheScreen();
    expect(screen.getByText('Nenhum aluno vinculado')).toBeOnTheScreen();
    expect(screen.getByText('Fale com a secretaria.')).toBeOnTheScreen();
    expect(screen.getByText('ação')).toBeOnTheScreen();
    const illustration = screen.getByTestId('vazio-illustration', {
      includeHiddenElements: true,
    });
    expect(illustration).toHaveStyle(theme.sizes.illustration);
    expect(illustration).toHaveProp('accessible', false);
  });

  it('sem ilustração quando pedido', async () => {
    await renderWithTheme(
      <EmptyState testID="vazio" title="Sem aulas" illustration={false} />,
    );

    expect(
      screen.queryByTestId('vazio-illustration', {
        includeHiddenElements: true,
      }),
    ).toBeNull();
  });
});

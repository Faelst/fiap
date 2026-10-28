import { screen } from '@testing-library/react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { SectionTitle } from '../SectionTitle';

describe('SectionTitle', () => {
  it('título da seção como header, lido em caixa normal', async () => {
    await renderWithTheme(
      <SectionTitle
        testID="agenda-title"
        title="AGENDA"
        accessibilityLabel="Agenda"
      />,
    );

    const title = screen.getByTestId('agenda-title');
    expect(title).toHaveTextContent('AGENDA');
    expect(title).toHaveProp('accessibilityRole', 'header');
    expect(title).toHaveAccessibleName('Agenda');
  });
});

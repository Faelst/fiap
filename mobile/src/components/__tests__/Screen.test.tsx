import { screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { Screen } from '../Screen';

const insets = { top: 47, bottom: 34, left: 0, right: 0 };

describe('Screen', () => {
  beforeEach(() => {
    jest.mocked(useSafeAreaInsets).mockReturnValue(insets);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fundo `background` na tela inteira', async () => {
    await renderWithTheme(
      <Screen testID="tela">
        <Text>conteúdo</Text>
      </Screen>,
    );

    expect(screen.getByTestId('tela')).toHaveStyle({
      flex: 1,
      backgroundColor: theme.colors.background,
    });
  });

  it('conteúdo abaixo da área segura de cima, numa coluna de no máximo 600', async () => {
    await renderWithTheme(
      <Screen testID="tela">
        <Text>conteúdo</Text>
      </Screen>,
    );

    const [column] = screen.getByTestId('tela').children as unknown as {
      props: { style: unknown };
    }[];
    expect(StyleSheet.flatten(column.props.style as object)).toMatchObject({
      paddingTop: insets.top,
      maxWidth: theme.sizes.contentMaxWidth,
    });
  });
});

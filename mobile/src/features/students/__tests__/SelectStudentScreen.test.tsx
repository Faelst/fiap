import { ThemeProvider } from '@shopify/restyle';
import { render, screen } from '@testing-library/react-native';

import { queryClient, queryKeys } from '../../../app/queryClient';
import type { RootStackScreenProps } from '../../../navigation/types';
import { useSessionStore } from '../../../stores/session.store';
import { meResponse } from '../../../test/fixtures';
import { QueryWrapper } from '../../../test/queryWrapper';
import { theme } from '../../../theme';
import { SelectStudentScreen } from '../SelectStudentScreen';

const TOP_INSET = 47;

jest.mock('react-native-safe-area-context', () => {
  const mock = jest.requireActual(
    'react-native-safe-area-context/jest/mock',
  ).default;
  return {
    ...mock,
    useSafeAreaInsets: () => ({ top: 47, bottom: 34, left: 0, right: 0 }),
  };
});

type Props = RootStackScreenProps<'SelectStudent'>;

describe('SelectStudentScreen', () => {
  beforeEach(() => {
    queryClient.clear();
    queryClient.setQueryData(queryKeys.me(), meResponse);
    useSessionStore.setState({ status: 'signedIn', selectedStudentId: 's1' });
  });

  const renderScreen = () =>
    render(
      <QueryWrapper>
        <ThemeProvider theme={theme}>
          <SelectStudentScreen
            {...({ navigation: { goBack: jest.fn() } } as unknown as Props)}
          />
        </ThemeProvider>
      </QueryWrapper>,
    );

  it('FECHAR fica abaixo da área segura de cima (não sobre a status bar)', async () => {
    await renderScreen();

    expect(screen.getByTestId('select-student-close')).toHaveStyle({
      top: TOP_INSET + theme.spacing.m,
      right: theme.spacing.m,
    });
    expect(
      screen.getByTestId('select-student-close-button'),
    ).toHaveAccessibleName('Fechar');
  });

  it('título e um card por aluno, com o atual selecionado', async () => {
    await renderScreen();

    expect(
      screen.getByText('Escolha o perfil\nque você quer visualizar'),
    ).toBeOnTheScreen();
    expect(screen.getByTestId('select-student-card-12567')).toBeSelected();
    expect(screen.getByTestId('select-student-card-12568')).not.toBeSelected();
  });
});

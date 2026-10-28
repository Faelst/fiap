import { ThemeProvider } from '@shopify/restyle';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { RefreshControl } from 'react-native';

import { queryClient, queryKeys } from '../../../app/queryClient';
import { useSessionStore } from '../../../stores/session.store';
import { meResponse } from '../../../test/fixtures';
import { QueryWrapper } from '../../../test/queryWrapper';
import { Text, theme } from '../../../theme';
import { TabScreenLayout } from '../TabScreenLayout';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const { floatingTabBar } = theme.sizes;
// Sem home indicator: barra (64) + `m` da borda + `m` de folga.
const inset = floatingTabBar.height + 2 * theme.spacing.m;

const renderLayout = (
  props: Partial<Parameters<typeof TabScreenLayout>[0]> = {},
) =>
  render(
    <QueryWrapper>
      <ThemeProvider theme={theme}>
        <TabScreenLayout
          title="Agenda"
          titleTestID="agenda-title"
          scrollTestID="agenda-scroll"
          {...props}
        >
          <Text testID="conteudo">conteúdo</Text>
        </TabScreenLayout>
      </ThemeProvider>
    </QueryWrapper>,
  );

describe('TabScreenLayout', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    useSessionStore.setState({ status: 'signedIn', selectedStudentId: 's1' });
    queryClient.clear();
    queryClient.setQueryData(queryKeys.me(), meResponse);
  });

  it('header compacto com a saudação, o título e o chip do aluno em uso', async () => {
    await renderLayout();

    expect(screen.getByTestId('header-greeting')).toHaveTextContent(
      'Olá, Gustavo',
    );
    expect(screen.getByTestId('agenda-title')).toHaveTextContent('Agenda');
    expect(screen.getByTestId('header-student-chip')).toHaveAccessibleName(
      'Aluno Rafael, turma 7EF, RM 12567, período Matutino',
    );
  });

  it('tocar no chip leva à aba Perfil', async () => {
    await renderLayout();

    await fireEvent.press(screen.getByTestId('header-student-chip'));

    expect(mockNavigate).toHaveBeenCalledWith('Perfil');
  });

  it('no Perfil, sem o chip', async () => {
    await renderLayout({ showChip: false });

    expect(screen.queryByTestId('header-student-chip')).toBeNull();
    expect(screen.getByTestId('header-greeting')).toBeOnTheScreen();
  });

  it('o conteúdo rola embaixo do header e termina acima da tab bar flutuante (N1)', async () => {
    await renderLayout();

    const scroll = screen.getByTestId('agenda-scroll');
    expect(scroll).toContainElement(screen.getByTestId('conteudo'));
    expect(scroll).not.toContainElement(screen.getByTestId('header'));
    expect(scroll.props.contentContainerStyle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ paddingBottom: inset }),
      ]),
    );
    expect(scroll).toHaveProp('scrollIndicatorInsets', { bottom: inset });
    // A rolagem alimenta a divisória do header (UI thread).
    expect(scroll).toHaveProp('scrollEventThrottle', 16);
    expect(scroll.props.onScroll).toBeDefined();
  });

  it('repassa o pull-to-refresh', async () => {
    await renderLayout({
      refreshControl: (
        <RefreshControl refreshing={false} onRefresh={() => {}} />
      ),
    });

    expect(
      screen.getByTestId('agenda-scroll').props.refreshControl,
    ).toBeDefined();
  });
});

import { ThemeProvider } from '@shopify/restyle';
import { act, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

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

  type TransitionEnd = (event: { data: { closing: boolean } }) => void;
  let transitionEnd: TransitionEnd | undefined;
  const unsubscribe = jest.fn();
  const navigation = {
    goBack: jest.fn(),
    addListener: jest.fn((event: string, listener: TransitionEnd) => {
      if (event === 'transitionEnd') transitionEnd = listener;
      return unsubscribe;
    }),
  };

  const renderScreen = () =>
    render(
      <QueryWrapper>
        <ThemeProvider theme={theme}>
          <SelectStudentScreen
            {...({ navigation } as unknown as Props)}
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

  describe('foco do leitor de tela (6.4)', () => {
    const sendEvent = AccessibilityInfo.sendAccessibilityEvent as jest.Mock;
    const title = 'Escolha o perfil\nque você quer visualizar';

    beforeEach(() => {
      sendEvent.mockClear();
      transitionEnd = undefined;
    });

    it('começa no título quando o modal termina de entrar', async () => {
      await renderScreen();
      expect(sendEvent).not.toHaveBeenCalled();

      await act(() => transitionEnd?.({ data: { closing: false } }));

      expect(sendEvent).toHaveBeenCalledTimes(1);
      // O alvo é o `ref` do título (no Jest, a instância do Text mockado).
      const [target, event] = sendEvent.mock.calls[0];
      expect(event).toBe('focus');
      expect(target.props).toMatchObject({
        accessibilityRole: 'header',
        children: title,
      });
    });

    it('não mexe no foco quando o modal está saindo', async () => {
      await renderScreen();

      await act(() => transitionEnd?.({ data: { closing: true } }));

      expect(sendEvent).not.toHaveBeenCalled();
    });

    it('para de ouvir a navegação ao desmontar', async () => {
      const { unmount } = await renderScreen();
      unsubscribe.mockClear();

      await unmount();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});

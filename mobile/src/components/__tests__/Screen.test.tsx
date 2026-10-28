import { screen } from '@testing-library/react-native';
import { Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { renderWithTheme } from '../../test/renderWithTheme';
import { Screen } from '../Screen';

// O KeyboardAvoidingView não repassa `behavior` à View nativa: o mock expõe
// as props recebidas numa View com testID próprio.
jest.mock(
  'react-native/Libraries/Components/Keyboard/KeyboardAvoidingView',
  () => {
    const { View } = require('react-native');
    return {
      __esModule: true,
      default: (props: object) => <View testID="keyboard-avoider" {...props} />,
    };
  },
);

const insets = { top: 47, bottom: 34, left: 0, right: 0 };

const renderKeyboardScreen = () =>
  renderWithTheme(
    <Screen testID="tela" keyboard scroll footer={<Text>rodapé</Text>}>
      <Text>conteúdo</Text>
    </Screen>,
  );

const keyboardAvoider = () => screen.getByTestId('keyboard-avoider').props;

describe('Screen', () => {
  beforeEach(() => {
    jest.mocked(useSafeAreaInsets).mockReturnValue(insets);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('no iOS o teclado empurra o conteúdo com padding', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');

    await renderKeyboardScreen();

    expect(keyboardAvoider().behavior).toBe('padding');
  });

  it('no Android (edge-to-edge, sem adjustResize) também usa padding', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');

    await renderKeyboardScreen();

    expect(keyboardAvoider().behavior).toBe('padding');
  });

  it('com rodapé cuidando do inset, o inset de baixo fica atrás do teclado', async () => {
    await renderKeyboardScreen();

    expect(keyboardAvoider().keyboardVerticalOffset).toBe(-insets.bottom);
  });
});

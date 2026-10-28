import { act, renderHook } from '@testing-library/react-native';
import {
  Dimensions,
  Keyboard,
  Platform,
  type KeyboardEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { revealOffset, useKeyboardReveal } from '../useKeyboardReveal';

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
  useReducedMotion: jest.fn(() => false),
}));

describe('revealOffset', () => {
  const base = { viewportTop: 20, margin: 16 };

  it('alvo visível acima do teclado: não rola', () => {
    // Fundo do alvo em 400 do conteúdo; janela visível até 500 − 20.
    expect(
      revealOffset({
        ...base,
        targetBottom: 400,
        keyboardTop: 500,
        scrollY: 0,
      }),
    ).toBeNull();
  });

  it('alvo atrás do teclado: rola até ele ficar `margin` acima', () => {
    // Precisa ver 600 + 16 = 616; vê até 0 + 480 − 20 = 460 → rola 156.
    expect(
      revealOffset({
        ...base,
        targetBottom: 600,
        keyboardTop: 480,
        scrollY: 0,
      }),
    ).toBe(156);
  });

  it('conta a rolagem que já existe', () => {
    expect(
      revealOffset({
        ...base,
        targetBottom: 600,
        keyboardTop: 480,
        scrollY: 100,
      }),
    ).toBe(156);
    expect(
      revealOffset({
        ...base,
        targetBottom: 600,
        keyboardTop: 480,
        scrollY: 200,
      }),
    ).toBeNull();
  });
});

describe('useKeyboardReveal', () => {
  const windowHeight = Dimensions.get('window').height;
  let listeners: Record<string, (event: KeyboardEvent) => void>;

  const keyboardEvent = (screenY: number) =>
    ({
      endCoordinates: {
        screenY,
        height: windowHeight - screenY,
        screenX: 0,
        width: 0,
      },
    } as KeyboardEvent);

  const layout = (y: number, height: number) =>
    ({
      nativeEvent: { layout: { x: 0, y, width: 300, height } },
    } as LayoutChangeEvent);

  const setup = async () => {
    const scrollTo = jest.fn();
    const hook = await renderHook(() =>
      useKeyboardReveal({ viewportTop: 0, margin: 16 }),
    );
    // A ScrollView real não existe no renderHook.
    (hook.result.current.scrollRef as { current: unknown }).current = {
      scrollTo,
    };
    await act(() => hook.result.current.onTargetLayout(layout(800, 400)));
    return { ...hook, scrollTo };
  };

  beforeEach(() => {
    listeners = {};
    jest.mocked(useReducedMotion).mockReturnValue(false);
    jest.spyOn(Keyboard, 'addListener').mockImplementation(((
      name: string,
      callback: (event: KeyboardEvent) => void,
    ) => {
      listeners[name] = callback;
      return { remove: jest.fn() };
    }) as unknown as typeof Keyboard.addListener);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('no iOS', () => {
    beforeEach(() => {
      jest.replaceProperty(Platform, 'OS', 'ios');
    });

    it('com o alvo armado, o teclado subindo rola até o fim do alvo', async () => {
      const { result, scrollTo } = await setup();
      await act(() => result.current.armed.onFocus());

      // Alvo de 800 a 1200; teclado a partir de 900: rola 1216 − 900.
      await act(() => listeners.keyboardWillShow(keyboardEvent(900)));

      expect(scrollTo).toHaveBeenCalledWith({ y: 316, animated: true });
    });

    it('sem o alvo armado (outro campo com foco), o teclado não rola nada', async () => {
      const { scrollTo } = await setup();

      await act(() => listeners.keyboardWillShow(keyboardEvent(900)));

      expect(scrollTo).not.toHaveBeenCalled();
    });

    it('com o teclado já aberto, armar o alvo rola na hora', async () => {
      const { result, scrollTo } = await setup();
      await act(() => listeners.keyboardWillShow(keyboardEvent(900)));

      await act(() => result.current.armed.onFocus());

      expect(scrollTo).toHaveBeenCalledWith({ y: 316, animated: true });
    });

    it('depois do blur, o teclado não rola mais', async () => {
      const { result, scrollTo } = await setup();
      await act(() => result.current.armed.onFocus());
      await act(() => result.current.armed.onBlur());

      await act(() => listeners.keyboardWillShow(keyboardEvent(900)));

      expect(scrollTo).not.toHaveBeenCalled();
    });

    it('com reduzir movimento rola sem animação', async () => {
      jest.mocked(useReducedMotion).mockReturnValue(true);
      const { result, scrollTo } = await setup();
      await act(() => result.current.armed.onFocus());

      await act(() => listeners.keyboardWillShow(keyboardEvent(900)));

      expect(scrollTo).toHaveBeenCalledWith({ y: 316, animated: false });
    });

    it('o espaço do teclado é do sistema (automaticallyAdjustKeyboardInsets): inset 0', async () => {
      const { result } = await setup();

      await act(() => listeners.keyboardWillShow(keyboardEvent(900)));

      expect(result.current.keyboardInset).toBe(0);
    });
  });

  describe('no Android (edge-to-edge)', () => {
    beforeEach(() => {
      jest.replaceProperty(Platform, 'OS', 'android');
    });

    it('o teclado abre espaço embaixo da rolagem e some ao fechar', async () => {
      const { result } = await setup();

      await act(() => listeners.keyboardDidShow(keyboardEvent(900)));
      expect(result.current.keyboardInset).toBe(windowHeight - 900);

      await act(() => listeners.keyboardDidHide(keyboardEvent(windowHeight)));
      expect(result.current.keyboardInset).toBe(0);
    });

    it('com o alvo armado, rola até o fim do alvo', async () => {
      const { result, scrollTo } = await setup();
      await act(() => result.current.armed.onFocus());

      await act(() => listeners.keyboardDidShow(keyboardEvent(900)));

      expect(scrollTo).toHaveBeenCalledWith({ y: 316, animated: true });
    });
  });

  it('acompanha a rolagem atual', async () => {
    jest.replaceProperty(Platform, 'OS', 'ios');
    const { result, scrollTo } = await setup();
    await act(() =>
      result.current.onScroll({
        nativeEvent: { contentOffset: { x: 0, y: 400 } },
      } as Parameters<typeof result.current.onScroll>[0]),
    );
    await act(() => result.current.armed.onFocus());

    await act(() => listeners.keyboardWillShow(keyboardEvent(900)));

    // 1216 já está à vista com 400 rolados (400 + 900 = 1300).
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

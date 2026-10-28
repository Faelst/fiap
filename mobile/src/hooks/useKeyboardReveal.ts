import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  useWindowDimensions,
  type KeyboardEvent,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

type RevealInput = {
  /** Fundo do alvo, em coordenadas do conteúdo da rolagem. */
  targetBottom: number;
  /** Topo do teclado, em coordenadas da janela (`endCoordinates.screenY`). */
  keyboardTop: number;
  /** Topo da área da rolagem na janela. */
  viewportTop: number;
  scrollY: number;
  /** Folga entre o alvo e o teclado. */
  margin: number;
};

/**
 * Quanto rolar para o alvo ficar `margin` acima do teclado, ou `null` se ele
 * já está à vista. Só desce: nunca rola para cima.
 */
export function revealOffset({
  targetBottom,
  keyboardTop,
  viewportTop,
  scrollY,
  margin,
}: RevealInput): number | null {
  const visibleBottom = scrollY + keyboardTop - viewportTop;
  const needed = targetBottom + margin;
  return needed > visibleBottom ? needed - (keyboardTop - viewportTop) : null;
}

/**
 * Eventos de teclado por plataforma. No iOS o `will` chega com o quadro
 * final, a tempo de a rolagem andar junto com o teclado; no Android só
 * existe o `did`.
 */
const keyboardEvents = () =>
  Platform.OS === 'ios'
    ? ({ show: 'keyboardWillShow', hide: 'keyboardWillHide' } as const)
    : ({ show: 'keyboardDidShow', hide: 'keyboardDidHide' } as const);

/**
 * Mantém um alvo (o fim do card do login, com o botão) acima do teclado
 * enquanto o campo "armado" tem foco (01-design.md da v2, 3.2). Sem
 * `KeyboardAvoidingView`, para nada se mexer no 1º frame:
 * - iOS: a `ScrollView` usa `automaticallyAdjustKeyboardInsets` (o sistema
 *   abre o espaço embaixo) e este hook só rola até o alvo;
 * - Android (edge-to-edge, o `adjustResize` não encolhe a janela):
 *   `keyboardInset` é a altura coberta pelo teclado, para a tela somar ao
 *   padding de baixo da rolagem, e a mesma conta rola até o alvo.
 */
export function useKeyboardReveal({
  viewportTop,
  margin,
}: {
  viewportTop: number;
  margin: number;
}) {
  const reducedMotion = useReducedMotion();
  const { height: windowHeight } = useWindowDimensions();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const scrollY = useRef(0);
  const targetBottom = useRef(0);
  const keyboardTop = useRef<number | null>(null);
  const armed = useRef(false);
  const [keyboardInset, setKeyboardInset] = useState(0);

  const reveal = useCallback(() => {
    if (!armed.current || keyboardTop.current === null) return;
    const y = revealOffset({
      targetBottom: targetBottom.current,
      keyboardTop: keyboardTop.current,
      viewportTop,
      scrollY: scrollY.current,
      margin,
    });
    if (y !== null) {
      scrollRef.current?.scrollTo({ y, animated: !reducedMotion });
    }
  }, [viewportTop, margin, reducedMotion]);

  useEffect(() => {
    const events = keyboardEvents();
    const show = Keyboard.addListener(events.show, (event: KeyboardEvent) => {
      keyboardTop.current = event.endCoordinates.screenY;
      if (Platform.OS === 'android') {
        setKeyboardInset(
          Math.max(0, windowHeight - event.endCoordinates.screenY),
        );
      }
      reveal();
    });
    const hide = Keyboard.addListener(events.hide, () => {
      keyboardTop.current = null;
      setKeyboardInset(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [reveal, windowHeight]);

  return {
    scrollRef,
    keyboardInset,
    /**
     * `onContentSizeChange` da rolagem. No Android o padding do teclado só
     * entra no layout depois do evento, e o `scrollTo` do evento fica preso
     * no fim antigo do conteúdo: quando o conteúdo cresce, rola de novo.
     */
    onContentSizeChange: () => {
      if (Platform.OS === 'android') reveal();
    },
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.current = event.nativeEvent.contentOffset.y;
    },
    /** `onLayout` do alvo, filho direto do conteúdo da rolagem. */
    onTargetLayout: (event: LayoutChangeEvent) => {
      const { y, height } = event.nativeEvent.layout;
      targetBottom.current = y + height;
    },
    /** Foco e blur do campo que, com foco, mantém o alvo à vista. */
    armed: {
      onFocus: () => {
        armed.current = true;
        reveal();
      },
      onBlur: () => {
        armed.current = false;
      },
    },
  };
}

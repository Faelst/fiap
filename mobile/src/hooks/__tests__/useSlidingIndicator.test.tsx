import { ThemeProvider } from '@shopify/restyle';
import { renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import {
  useReducedMotion,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { theme } from '../../theme';
import {
  indicatorTranslateX,
  proximityOpacity,
  useActiveLayerStyle,
  useSlidingIndicator,
  type SlidingIndicatorOptions,
} from '../useSlidingIndicator';

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated/mock');
  return {
    ...actual,
    useReducedMotion: jest.fn(() => false),
    withSpring: jest.fn(actual.withSpring),
  };
});

const springMock = withSpring as jest.Mock;
const reducedMotionMock = useReducedMotion as jest.Mock;

function Wrapper({ children }: PropsWithChildren) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

/** Shared value externo, como o `progress` do pager. */
const progressOf = (value: number) =>
  ({ get: () => value, value } as unknown as SharedValue<number>);

const translateXOf = (style: unknown) =>
  (style as { transform: [{ translateX: number }] }).transform[0].translateX;

const renderIndicator = (initial: SlidingIndicatorOptions) =>
  renderHook(
    (options: SlidingIndicatorOptions) => useSlidingIndicator(options),
    {
      initialProps: initial,
      wrapper: Wrapper,
    },
  );

beforeEach(() => {
  springMock.mockClear();
  reducedMotionMock.mockReturnValue(false);
});

describe('indicatorTranslateX', () => {
  it('posição × (largura do item + gap)', () => {
    expect(indicatorTranslateX(0, 100, 4)).toBe(0);
    expect(indicatorTranslateX(2, 100, 4)).toBe(208);
    expect(indicatorTranslateX(1.5, 51, 4)).toBeCloseTo(82.5);
  });
});

describe('proximityOpacity', () => {
  it('1 com o indicador em cima do item e 0 a uma largura de distância', () => {
    expect(proximityOpacity(1, 1, 100, 0)).toBe(1);
    expect(proximityOpacity(0, 1, 100, 0)).toBe(0);
    expect(proximityOpacity(3, 1, 100, 0)).toBe(0);
  });

  it('no meio do caminho, metade (a cor acompanha o indicador)', () => {
    expect(proximityOpacity(0.5, 1, 100, 0)).toBeCloseTo(0.5);
    expect(proximityOpacity(0.5, 0, 100, 0)).toBeCloseTo(0.5);
  });

  it('conta o gap na distância (distância em px ÷ largura do item)', () => {
    // 0,5 passo de 104 px = 52 px de distância → 1 − 52/100.
    expect(proximityOpacity(0.5, 1, 100, 4)).toBeCloseTo(0.48);
  });

  it('antes do 1º layout (largura 0): só o item mais próximo acende', () => {
    expect(proximityOpacity(1, 1, 0, 0)).toBe(1);
    expect(proximityOpacity(1, 2, 0, 0)).toBe(0);
    expect(proximityOpacity(1.4, 1, 0, 0)).toBe(1);
  });
});

describe('useSlidingIndicator', () => {
  it('modo index: começa no índice, sem animar', async () => {
    const { result } = await renderIndicator({
      count: 3,
      index: 1,
      itemWidth: 100,
    });

    expect(translateXOf(result.current.indicatorStyle)).toBe(100);
    expect(springMock).not.toHaveBeenCalled();
  });

  it('modo index: troca de índice desliza com a mola snappy', async () => {
    const { result, rerender } = await renderIndicator({
      count: 3,
      index: 0,
      itemWidth: 100,
    });

    await rerender({ count: 3, index: 2, itemWidth: 100 });

    expect(springMock).toHaveBeenCalledWith(2, theme.motion.spring.snappy);
    expect(translateXOf(result.current.indicatorStyle)).toBe(200);
  });

  it('modo index com reduzir movimento: vai direto, sem mola', async () => {
    reducedMotionMock.mockReturnValue(true);
    const { result, rerender } = await renderIndicator({
      count: 3,
      index: 0,
      itemWidth: 100,
    });

    await rerender({ count: 3, index: 2, itemWidth: 100 });

    expect(springMock).not.toHaveBeenCalled();
    expect(translateXOf(result.current.indicatorStyle)).toBe(200);
  });

  it('modo progress: segue o valor externo direto, com o gap', async () => {
    const { result } = await renderIndicator({
      count: 7,
      progress: progressOf(1.5),
      itemWidth: 50,
      gap: 4,
    });

    expect(translateXOf(result.current.indicatorStyle)).toBe(81);
    expect(springMock).not.toHaveBeenCalled();
  });

  it('modo progress: o overscroll do pager não leva o indicador para fora', async () => {
    const before = await renderIndicator({
      count: 7,
      progress: progressOf(-0.3),
      itemWidth: 50,
    });
    expect(translateXOf(before.result.current.indicatorStyle)).toBe(0);

    const after = await renderIndicator({
      count: 7,
      progress: progressOf(6.4),
      itemWidth: 50,
    });
    expect(translateXOf(after.result.current.indicatorStyle)).toBe(300);
  });
});

describe('useActiveLayerStyle', () => {
  it('opacidade da camada ativa pela proximidade do indicador', async () => {
    const { result } = await renderHook(
      () => {
        const indicator = useSlidingIndicator({
          count: 3,
          progress: progressOf(0.25),
          itemWidth: 100,
        });
        return [
          useActiveLayerStyle(indicator, 0),
          useActiveLayerStyle(indicator, 1),
          useActiveLayerStyle(indicator, 2),
        ];
      },
      { wrapper: Wrapper },
    );

    const [first, second, third] = result.current.map(
      style => (style as unknown as { opacity: number }).opacity,
    );
    expect(first).toBeCloseTo(0.75);
    expect(second).toBeCloseTo(0.25);
    expect(third).toBe(0);
  });
});

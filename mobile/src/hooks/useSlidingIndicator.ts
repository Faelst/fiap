import { useEffect, useRef } from 'react';
import {
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withSpring,
  type DerivedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { useTheme } from '../theme';

/** `translateX` do indicador na posição `position` (em itens, pode ser fracionária). */
export function indicatorTranslateX(
  position: number,
  itemWidth: number,
  gap: number,
): number {
  'worklet';
  return position * (itemWidth + gap);
}

/**
 * Opacidade da camada "ativa" do item `index` (01-design.md da v2, 2.4):
 * `clamp(1 − |posIndicador − posItem| / larguraDoItem, 0, 1)`, em px. Antes
 * do 1º layout (largura 0) acende só o item mais próximo.
 */
export function proximityOpacity(
  position: number,
  index: number,
  itemWidth: number,
  gap: number,
): number {
  'worklet';
  if (itemWidth <= 0) return Math.round(position) === index ? 1 : 0;
  const distance = Math.abs(position - index) * (itemWidth + gap);
  return Math.min(Math.max(1 - distance / itemWidth, 0), 1);
}

type Layout = {
  /** Quantidade de itens: a posição fica entre 0 e `count − 1`. */
  count: number;
  /** Largura de um item, do `onLayout` (0 antes do 1º layout). */
  itemWidth: number;
  gap?: number;
};

export type SlidingIndicatorOptions = Layout &
  (
    | {
        /** Item ativo: o indicador vai até ele com a mola `snappy`. */
        index: number;
        progress?: never;
      }
    | {
        /** Posição externa em itens (a rolagem do pager): lida direto, sem mola. */
        progress: SharedValue<number>;
        index?: never;
      }
  );

export type SlidingIndicator = {
  /** Posição do indicador em itens. */
  position: DerivedValue<number>;
  itemWidth: number;
  gap: number;
  indicatorStyle: ReturnType<typeof useAnimatedStyle>;
};

/**
 * Indicador que desliza (01-design.md da v2, 2.17): fonte única da tab bar,
 * do segmento e da faixa semanal. No modo `index` anima com
 * `motion.spring.snappy` (direto com reduzir movimento); no modo `progress`
 * segue o shared value de fora, já que quem anima é a rolagem nativa.
 */
export function useSlidingIndicator(
  options: SlidingIndicatorOptions,
): SlidingIndicator {
  const { count, itemWidth, gap = 0, index, progress } = options;
  const { motion } = useTheme();
  const reducedMotion = useReducedMotion();
  const target = index ?? 0;
  const animatedIndex = useSharedValue(target);
  // Só a troca de índice anima: a 1ª renderização já nasce no lugar.
  const previousTarget = useRef(target);

  useEffect(() => {
    if (progress || previousTarget.current === target) return;
    previousTarget.current = target;
    animatedIndex.set(
      reducedMotion ? target : withSpring(target, motion.spring.snappy),
    );
  }, [target, progress, reducedMotion, animatedIndex, motion.spring.snappy]);

  const position = useDerivedValue(() => {
    const raw = progress ? progress.get() : animatedIndex.get();
    return Math.min(Math.max(raw, 0), Math.max(count - 1, 0));
  });

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: indicatorTranslateX(position.get(), itemWidth, gap) },
    ],
  }));

  return { position, itemWidth, gap, indicatorStyle };
}

/**
 * Estilo da camada ativa do item `index` (ícone e texto na cor ativa por
 * cima da inativa): a cor acompanha o indicador no meio do caminho, sem
 * `setState` (crossfade, 1.10 regra 1).
 */
export function useActiveLayerStyle(
  indicator: SlidingIndicator,
  index: number,
) {
  const { position, itemWidth, gap } = indicator;
  return useAnimatedStyle(() => ({
    opacity: proximityOpacity(position.get(), index, itemWidth, gap),
  }));
}

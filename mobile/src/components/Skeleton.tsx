import {
  createContext,
  useContext,
  useEffect,
  useId,
  type PropsWithChildren,
} from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Box, useTheme, type BoxProps, type Theme } from '../theme';

type Shimmer = {
  /** Passada da faixa, 0 → 1, compartilhada por todos os blocos do grupo. */
  progress: SharedValue<number>;
  reducedMotion: boolean;
};

const ShimmerContext = createContext<Shimmer | null>(null);

/**
 * Um shimmer por tela (01-design.md da v2, 2.16): todos os blocos de dentro
 * leem o mesmo `progress`, num loop linear sem fim que é cancelado ao
 * desmontar. Com reduzir movimento não há loop: os blocos ficam parados.
 */
export function SkeletonGroup({ children }: PropsWithChildren) {
  const { motion } = useTheme();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    progress.set(
      withRepeat(
        withTiming(1, {
          duration: motion.shimmer.duration,
          easing: Easing.linear,
        }),
        -1,
      ),
    );
    return () => cancelAnimation(progress);
  }, [reducedMotion, progress, motion.shimmer.duration]);

  return (
    <ShimmerContext.Provider value={{ progress, reducedMotion }}>
      {children}
    </ShimmerContext.Provider>
  );
}

/** `translateX` da faixa: de `−faixa` (fora, à esquerda) até a largura do bloco. */
export function shimmerTranslateX(
  progress: number,
  blockWidth: number,
  band: number,
): number {
  'worklet';
  return -band + progress * (blockWidth + band);
}

type Radius = Exclude<keyof Theme['borderRadii'], 'none'>;

type SkeletonProps = Omit<BoxProps, 'backgroundColor' | 'borderRadius'> & {
  radius?: Radius;
};

/**
 * Bloco do skeleton em `surfaceHigh`. Dentro de um `SkeletonGroup`, uma faixa
 * clara (degradê em SVG) atravessa o bloco só com `translateX`. Fora de um
 * grupo é só o bloco: os skeletons da v1 pulsam por fora até a fatia 9.
 */
export function Skeleton({ radius = 'm', testID, ...props }: SkeletonProps) {
  const shimmer = useContext(ShimmerContext);
  const { motion } = useTheme();
  const reduced = shimmer?.reducedMotion ?? false;

  return (
    <Box
      testID={testID}
      backgroundColor="surfaceHigh"
      borderRadius={radius}
      overflow="hidden"
      {...props}
      opacity={reduced ? motion.shimmer.reducedOpacity : props.opacity}
    >
      {shimmer && !reduced ? (
        <ShimmerBand progress={shimmer.progress} testID={testID} />
      ) : null}
    </Box>
  );
}

/**
 * A faixa vai de `−largura da faixa` até a largura do bloco. Ela mede o
 * próprio contêiner (absoluto, do tamanho do bloco) para não depender do
 * `onLayout` de quem usa o `Skeleton`.
 */
function ShimmerBand({
  progress,
  testID,
}: {
  progress: SharedValue<number>;
  testID?: string;
}) {
  const { gradients, sizes } = useTheme();
  const band = sizes.skeleton.shimmerWidth;
  const blockWidth = useSharedValue(0);
  const gradientId = `shimmer-${useId()}`;

  const bandStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shimmerTranslateX(progress.get(), blockWidth.get(), band) },
    ],
  }));

  const onLayout = (event: LayoutChangeEvent) =>
    blockWidth.set(event.nativeEvent.layout.width);

  return (
    <Box
      testID={testID ? `${testID}-track` : undefined}
      style={StyleSheet.absoluteFill}
      onLayout={onLayout}
      pointerEvents="none"
    >
      <Animated.View
        testID={testID ? `${testID}-shimmer` : undefined}
        style={[styles.band, { width: band }, bandStyle]}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              {gradients.shimmer.map((stop, index, stops) => (
                <Stop
                  key={index}
                  offset={index / (stops.length - 1)}
                  stopColor={stop.color}
                  stopOpacity={stop.opacity}
                />
              ))}
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
        </Svg>
      </Animated.View>
    </Box>
  );
}

const styles = StyleSheet.create({
  band: { position: 'absolute', top: 0, bottom: 0, left: 0 },
});

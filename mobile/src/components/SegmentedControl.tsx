import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  type Insets,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import {
  proximityOpacity,
  useActiveLayerStyle,
  useSlidingIndicator,
  type SlidingIndicator,
} from '../hooks/useSlidingIndicator';
import { Box, Text, useTheme } from '../theme';

export type SegmentOption = {
  key: string;
  label: string;
  /** O que o leitor de tela diz (`1º trimestre`); padrão: o `label`. */
  accessibilityLabel?: string;
};

type SegmentedControlProps = {
  options: readonly SegmentOption[];
  selectedKey: string | null;
  onChange: (key: string) => void;
  /** `md` (44, itens dividem a largura) ou `sm` (36, itens de largura fixa). */
  size?: 'md' | 'sm';
  /** Filhos: `X-<key>` (cada item) e `X-indicator`. */
  testID: string;
};

/** `sm` tem 36 de altura: 4 a mais em cima e embaixo dão o alvo de 44. */
const SM_HIT_SLOP: Insets = { top: 4, bottom: 4 };

type SegmentProps = {
  option: SegmentOption;
  index: number;
  selected: boolean;
  indicator: SlidingIndicator;
  size: 'md' | 'sm';
  width?: number;
  testID: string;
  onPress: () => void;
};

/**
 * Um item do segmento: o texto existe em duas camadas (`textSecondary` e
 * `text`) e a opacidade de cada uma vem da distância até o indicador, como
 * na tab bar (2.4): a cor acompanha a mola, sem animar cor.
 */
function Segment({
  option,
  index,
  selected,
  indicator,
  size,
  width,
  testID,
  onPress,
}: SegmentProps) {
  const { sizes } = useTheme();
  const activeLayer = useActiveLayerStyle(indicator, index);
  const { position, itemWidth, gap } = indicator;
  const inactiveLayer = useAnimatedStyle(() => ({
    opacity: 1 - proximityOpacity(position.get(), index, itemWidth, gap),
  }));
  const variant = size === 'md' ? 'label' : 'caption';

  const label = (color: 'text' | 'textSecondary') => (
    <Text
      variant={variant}
      color={color}
      numberOfLines={1}
      textAlign="center"
      maxFontSizeMultiplier={sizes.fixedHeightFontScale}
    >
      {option.label}
    </Text>
  );

  return (
    <Pressable
      testID={testID}
      accessibilityRole="tab"
      accessibilityLabel={option.accessibilityLabel ?? option.label}
      accessibilityState={{ selected }}
      hitSlop={size === 'sm' ? SM_HIT_SLOP : undefined}
      onPress={onPress}
      style={width === undefined ? styles.flexItem : { width }}
    >
      <Animated.View style={[styles.layer, inactiveLayer]}>
        {label('textSecondary')}
      </Animated.View>
      <Animated.View style={[styles.layer, activeLayer]}>
        {label('text')}
      </Animated.View>
    </Pressable>
  );
}

/**
 * Seletor segmentado (01-design.md da v2, 2.11): ano (`sm`) e trimestre
 * (`md`) do Boletim. O indicador desliza com `useSlidingIndicator` (mola
 * `snappy`, direto com reduzir movimento). Com 1 opção só, vira uma pílula
 * estática do mesmo tamanho, sem toque, com o mesmo id do item.
 */
export function SegmentedControl({
  options,
  selectedKey,
  onChange,
  size = 'md',
  testID,
}: SegmentedControlProps) {
  const { borderRadii, sizes } = useTheme();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const count = options.length;
  const height = sizes.segmented[size];
  const padding = sizes.segmented.padding;
  // No `sm` o item tem largura fixa: o segmento fica do tamanho do conteúdo.
  const fixedWidth = size === 'sm' ? sizes.reportCard.yearItem : undefined;
  const itemWidth = fixedWidth ?? measuredWidth;
  const selectedIndex = Math.max(
    options.findIndex(option => option.key === selectedKey),
    0,
  );
  const indicator = useSlidingIndicator({
    count,
    itemWidth,
    index: selectedIndex,
  });

  if (count === 1) {
    const [only] = options;
    return (
      <Box testID={testID} alignSelf="flex-start">
        <Box
          testID={`${testID}-${only.key}`}
          accessible
          accessibilityRole="text"
          accessibilityLabel={only.accessibilityLabel ?? only.label}
          height={height}
          justifyContent="center"
          paddingHorizontal="m"
          borderRadius="pill"
          borderWidth={1}
          borderColor="borderSubtle"
          backgroundColor="surface"
        >
          <Text
            variant={size === 'md' ? 'label' : 'caption'}
            numberOfLines={1}
            maxFontSizeMultiplier={sizes.fixedHeightFontScale}
          >
            {only.label}
          </Text>
        </Box>
      </Box>
    );
  }

  const onItemsLayout = (event: LayoutChangeEvent) =>
    setMeasuredWidth(event.nativeEvent.layout.width / Math.max(count, 1));

  return (
    <Box
      testID={testID}
      accessibilityRole="tablist"
      alignSelf={fixedWidth === undefined ? 'stretch' : 'flex-start'}
      height={height}
      padding="xs"
      borderRadius="pill"
      borderWidth={1}
      borderColor="borderSubtle"
      backgroundColor="surface"
    >
      <Box
        style={StyleSheet.absoluteFill}
        justifyContent="center"
        pointerEvents="none"
      >
        <Animated.View
          testID={`${testID}-indicator`}
          style={[
            styles.indicator,
            {
              width: itemWidth,
              height: height - 2 * padding - 2,
              marginLeft: padding,
              borderRadius: borderRadii.pill,
            },
            indicator.indicatorStyle,
          ]}
        >
          <Box
            flex={1}
            borderRadius="pill"
            borderWidth={1}
            borderColor="borderStrong"
            backgroundColor="surfaceHigh"
          />
        </Animated.View>
      </Box>
      <Box flex={1} flexDirection="row" onLayout={onItemsLayout}>
        {options.map((option, index) => (
          <Segment
            key={option.key}
            option={option}
            index={index}
            selected={index === selectedIndex}
            indicator={indicator}
            size={size}
            width={fixedWidth}
            testID={`${testID}-${option.key}`}
            onPress={() => {
              if (option.key !== selectedKey) onChange(option.key);
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  flexItem: { flex: 1 },
  layer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: { overflow: 'hidden' },
});

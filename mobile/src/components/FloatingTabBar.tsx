import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import {
  proximityOpacity,
  useActiveLayerStyle,
  useSlidingIndicator,
  type SlidingIndicator,
} from '../hooks/useSlidingIndicator';
import { floatingTabBarBottom } from '../hooks/useFloatingTabBarInset';
import { Box, Card, Text, useTheme } from '../theme';

const FADE_GRADIENT_ID = 'tabBarFade';

type TabItemProps = {
  indicator: SlidingIndicator;
  index: number;
  focused: boolean;
  label: string;
  accessibilityLabel?: string;
  testID?: string;
  renderIcon: (color: string) => ReactNode;
  onPress: () => void;
};

/**
 * Um item da tab bar. Ícone e rótulo existem em duas camadas
 * (`textSecondary` e `primary`), e a opacidade de cada uma vem da distância
 * até o indicador (2.4): a cor acompanha o indicador no meio do caminho, sem
 * animar cor nem fazer `setState`. O ícone que acabou de ficar ativo faz
 * 1 → `tabIconPop` → 1 (4.1).
 */
function TabItem({
  indicator,
  index,
  focused,
  label,
  accessibilityLabel,
  testID,
  renderIcon,
  onPress,
}: TabItemProps) {
  const { colors, motion, sizes } = useTheme();
  const reducedMotion = useReducedMotion();
  const iconScale = useSharedValue(1);
  const wasFocused = useRef(focused);

  useEffect(() => {
    if (focused && !wasFocused.current && !reducedMotion) {
      iconScale.set(
        withSequence(
          withTiming(motion.tabIconPop, {
            duration: motion.fast,
            easing: Easing.out(Easing.cubic),
          }),
          withTiming(1, { duration: motion.fast }),
        ),
      );
    }
    wasFocused.current = focused;
  }, [focused, reducedMotion, iconScale, motion]);

  const activeLayer = useActiveLayerStyle(indicator, index);
  const { position, itemWidth, gap } = indicator;
  const inactiveLayer = useAnimatedStyle(() => ({
    opacity: 1 - proximityOpacity(position.get(), index, itemWidth, gap),
  }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.get() }],
  }));

  const layerContent = (colorName: 'textSecondary' | 'primary') => (
    <Box alignItems="center" gap="xxs">
      <Animated.View style={iconStyle}>
        <Box height={sizes.icon} justifyContent="center">
          {renderIcon(colors[colorName])}
        </Box>
      </Animated.View>
      <Text
        variant="tabLabel"
        color={colorName}
        numberOfLines={1}
        maxFontSizeMultiplier={sizes.fixedHeightFontScale}
      >
        {label}
      </Text>
    </Box>
  );

  return (
    <Pressable
      testID={testID}
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      style={styles.item}
    >
      <Animated.View
        testID={testID ? `${testID}-inactive-layer` : undefined}
        style={[styles.layer, inactiveLayer]}
      >
        {layerContent('textSecondary')}
      </Animated.View>
      <Animated.View
        testID={testID ? `${testID}-active-layer` : undefined}
        style={[styles.layer, activeLayer]}
      >
        {layerContent('primary')}
      </Animated.View>
    </Pressable>
  );
}

/**
 * Tab bar flutuante da v2 (01-design.md da v2, 2.4, V6): cápsula de raio
 * total acima da área segura, com um indicador teal que desliza até a aba
 * ativa (`useSlidingIndicator`). O conteúdo das abas rola por baixo dela
 * (padding de `useFloatingTabBarInset`) e esmaece num degradê, em vez de ser
 * cortado em seco. Ícone e rótulo vêm das options de cada aba.
 */
export function FloatingTabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  const { borderRadii, colors, gradients, shadows, sizes, spacing } =
    useTheme();
  const [itemWidth, setItemWidth] = useState(0);
  const count = state.routes.length;
  const indicator = useSlidingIndicator({
    count,
    itemWidth,
    index: state.index,
  });
  const { height, maxWidth, indicatorHeight, indicatorInset } =
    sizes.floatingTabBar;

  const onItemsLayout = (event: LayoutChangeEvent) =>
    setItemWidth(event.nativeEvent.layout.width / count);

  return (
    <Box
      testID="tab-bar-container"
      pointerEvents="box-none"
      position="absolute"
      left={0}
      right={0}
      bottom={0}
      paddingHorizontal={{ compact: 's', phone: 'm' }}
    >
      <Box
        testID="tab-bar-fade"
        pointerEvents="none"
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        height={sizes.tabBarFade}
      >
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={FADE_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
              {gradients.tabBarFade.map((stop, index, stops) => (
                <Stop
                  key={index}
                  offset={index / (stops.length - 1)}
                  stopColor={stop.color}
                  stopOpacity={stop.opacity}
                />
              ))}
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${FADE_GRADIENT_ID})`} />
        </Svg>
      </Box>
      <Card
        testID="tab-bar"
        variant="floating"
        accessibilityRole="tablist"
        width="100%"
        alignSelf="center"
        height={height}
        maxWidth={maxWidth}
        style={{
          marginBottom: floatingTabBarBottom(insets.bottom, spacing),
          boxShadow: [shadows.floating],
        }}
      >
        <Box
          style={StyleSheet.absoluteFill}
          justifyContent="center"
          pointerEvents="none"
        >
          <Animated.View
            testID="tab-bar-indicator"
            style={[
              {
                width: Math.max(itemWidth - 2 * indicatorInset, 0),
                height: indicatorHeight,
                marginLeft: indicatorInset,
                borderRadius: borderRadii.pill,
                backgroundColor: colors.primaryMuted,
                boxShadow: [shadows.glowPrimarySoft],
              },
              indicator.indicatorStyle,
            ]}
          />
        </Box>
        <Box
          testID="tab-bar-items"
          flex={1}
          flexDirection="row"
          onLayout={onItemsLayout}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const focused = state.index === index;
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : options.title ?? route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <TabItem
                key={route.key}
                indicator={indicator}
                index={index}
                focused={focused}
                label={label}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarButtonTestID}
                onPress={onPress}
                renderIcon={color =>
                  options.tabBarIcon?.({ focused, color, size: sizes.icon })
                }
              />
            );
          })}
        </Box>
      </Card>
    </Box>
  );
}

const styles = StyleSheet.create({
  item: { flex: 1 },
  layer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

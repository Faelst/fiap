import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect, useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Box, Text, useTheme } from '../theme';

type TabItemProps = {
  label: string;
  accessibilityLabel?: string;
  testID?: string;
  focused: boolean;
  renderIcon: (color: string) => ReactNode;
  onPress: () => void;
};

/**
 * Um item da tab bar. Ícone e rótulo existem em duas camadas sobrepostas
 * (`text` e `primary`) e a ativa aparece por crossfade de opacidade (4.4):
 * assim não se anima a cor do SVG, que não roda na UI thread. O ícone que
 * acabou de ficar ativo faz 1 → 1,12 → 1.
 */
function TabItem({
  label,
  accessibilityLabel,
  testID,
  focused,
  renderIcon,
  onPress,
}: TabItemProps) {
  const { colors, motion, sizes } = useTheme();
  const reducedMotion = useReducedMotion();
  const active = useSharedValue(focused ? 1 : 0);
  const iconScale = useSharedValue(1);
  const wasFocused = useRef(focused);

  useEffect(() => {
    const target = focused ? 1 : 0;
    if (reducedMotion) {
      active.set(target);
    } else {
      active.set(
        withTiming(target, { duration: motion.base, easing: motion.easeOut }),
      );
      if (focused && !wasFocused.current) {
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
    }
    wasFocused.current = focused;
  }, [focused, reducedMotion, active, iconScale, motion]);

  const activeLayer = useAnimatedStyle(() => ({ opacity: active.get() }));
  const inactiveLayer = useAnimatedStyle(() => ({
    opacity: 1 - active.get(),
  }));
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.get() }],
  }));

  const layer = (color: string, colorName: 'text' | 'primary') => (
    <Box alignItems="center" gap="xs">
      <Box height={sizes.icon} justifyContent="center">
        {renderIcon(color)}
      </Box>
      <Text
        variant="tabLabel"
        color={colorName}
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
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      style={styles.item}
    >
      <Box paddingTop="sm" alignItems="center">
        <Animated.View style={iconStyle}>
          <Animated.View style={inactiveLayer}>
            {layer(colors.text, 'text')}
          </Animated.View>
          <Animated.View
            testID={testID ? `${testID}-active-layer` : undefined}
            style={[StyleSheet.absoluteFill, activeLayer]}
          >
            {layer(colors.primary, 'primary')}
          </Animated.View>
        </Animated.View>
      </Box>
    </Pressable>
  );
}

/**
 * Tab bar do Figma (01-design.md, 2.4): fundo `surface`, altura
 * `sizes.tabBar` + inset de baixo, duas colunas iguais; aba ativa em
 * `primary`. Ícone e rótulo vêm das options de cada aba.
 */
export function TabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  const { sizes } = useTheme();

  return (
    <Box
      testID="tab-bar"
      accessibilityRole="tablist"
      flexDirection="row"
      backgroundColor="surface"
      style={{
        height: sizes.tabBar + insets.bottom,
        paddingBottom: insets.bottom,
      }}
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
            label={label}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            focused={focused}
            onPress={onPress}
            renderIcon={color =>
              options.tabBarIcon?.({ focused, color, size: sizes.icon })
            }
          />
        );
      })}
    </Box>
  );
}

const styles = StyleSheet.create({
  item: { flex: 1 },
});

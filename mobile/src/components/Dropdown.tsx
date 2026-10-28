import { useRef, useState, type ComponentRef } from 'react';
import {
  AccessibilityInfo,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { strings } from '../constants/strings';
import { Box, Card, Text, useTheme, type Theme } from '../theme';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

export type DropdownOption = { key: string; label: string };

type DropdownProps = {
  /** Texto do gatilho (a opção atual). */
  label: string;
  options: readonly DropdownOption[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  /** Gatilho; os filhos são `-label`, `-options`, `-option-<key>`, `-backdrop`, `-modal`. */
  testID: string;
  /** "Dia" ou "Turma e ano": o leitor lê "Dia: 17 de março, segunda-feira". */
  accessibilityLabelPrefix: string;
  accessibilityHint: string;
  /** `l` na Agenda e `m` no Boletim, como no Figma. */
  marginHorizontal: keyof Theme['spacing'];
};

type Anchor = { x: number; y: number; width: number; height: number };

/**
 * Dropdown da Agenda e do Boletim (01-design.md, 2.5 e 4.5). A lista abre num
 * `Modal` transparente, por cima do conteúdo, na posição do gatilho medida
 * por `measureInWindow` (sem briga de `zIndex` dentro da `ScrollView`). Abre
 * abaixo do gatilho ou, sem espaço, acima. Tocar fora ou o voltar do Android
 * fecham sem mudar nada. A opção atual não tem marca visual (Figma), só o
 * estado `selected` para o leitor de tela.
 */
export function Dropdown({
  label,
  options,
  selectedKey,
  onSelect,
  testID,
  accessibilityLabelPrefix,
  accessibilityHint,
  marginHorizontal,
}: DropdownProps) {
  const { colors, motion, sizes, spacing } = useTheme();
  const window = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const triggerRef = useRef<ComponentRef<typeof View>>(null);
  // Com âncora, o Modal está montado; `expanded` é o estado que o usuário vê.
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [expanded, setExpanded] = useState(false);
  const listProgress = useSharedValue(0);
  const chevronProgress = useSharedValue(0);

  const timing = (duration: number, easing: typeof motion.easeOut) => ({
    duration: reducedMotion ? 0 : duration,
    easing,
  });

  const open = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setExpanded(true);
      listProgress.set(withTiming(1, timing(motion.fast, motion.easeOut)));
      chevronProgress.set(withTiming(1, timing(motion.base, motion.easeOut)));
    });
  };

  const unmountList = () => {
    setAnchor(null);
    // O foco do leitor volta ao gatilho (01-design.md, 6.4).
    if (triggerRef.current) {
      AccessibilityInfo.sendAccessibilityEvent(triggerRef.current, 'focus');
    }
  };

  const close = () => {
    setExpanded(false);
    chevronProgress.set(withTiming(0, timing(motion.base, motion.easeOut)));
    listProgress.set(
      withTiming(0, timing(motion.exitFast, motion.easeIn), finished => {
        'worklet';
        // Reaberta no meio da saída: a animação foi interrompida e a lista fica.
        if (finished) scheduleOnRN(unmountList);
      }),
    );
  };

  const choose = (key: string) => {
    onSelect(key);
    close();
  };

  const listStyle = useAnimatedStyle(() => ({
    opacity: listProgress.get(),
    transform: [
      {
        translateY: (1 - listProgress.get()) * -motion.enterOffsetSmall,
      },
    ],
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${chevronProgress.get() * motion.chevronOpenDeg}deg` },
    ],
  }));

  const listPosition = anchor
    ? placeList(anchor, window.height, {
        gap: spacing.s,
        estimatedHeight: options.length * sizes.touchTarget + 2 * spacing.xs,
      })
    : null;

  return (
    <>
      <Pressable
        ref={triggerRef}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabelPrefix}: ${label}`}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ expanded }}
        onPress={expanded ? close : open}
        style={({ pressed }) => ({
          marginHorizontal: spacing[marginHorizontal],
          opacity: pressed ? motion.pressedOpacity : 1,
        })}
      >
        <Card variant="dropdown" gap="m">
          <Box flex={1}>
            <Text
              testID={`${testID}-label`}
              variant="body"
              numberOfLines={1}
              maxFontSizeMultiplier={sizes.fixedHeightFontScale}
            >
              {label}
            </Text>
          </Box>
          <Animated.View style={chevronStyle}>
            <ChevronDownIcon color={colors.primary} size={sizes.chevron} />
          </Animated.View>
        </Card>
      </Pressable>
      <Modal
        testID={`${testID}-modal`}
        visible={anchor !== null}
        transparent
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={close}
      >
        <Box style={StyleSheet.absoluteFill} accessibilityViewIsModal>
          <Pressable
            testID={`${testID}-backdrop`}
            style={StyleSheet.absoluteFill}
            accessibilityRole="button"
            accessibilityLabel={strings.common.closeListAccessibilityLabel}
            onPress={close}
          />
          {listPosition ? (
            <Animated.View
              testID={`${testID}-options`}
              style={[styles.list, listPosition, listStyle]}
            >
              <Card variant="options">
                {options.map(option => (
                  <Pressable
                    key={option.key}
                    testID={`${testID}-option-${option.key}`}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: option.key === selectedKey,
                    }}
                    onPress={() => choose(option.key)}
                    style={({ pressed }) => ({
                      minHeight: sizes.touchTarget,
                      paddingHorizontal: spacing.m,
                      justifyContent: 'center',
                      opacity: pressed ? motion.pressedOpacity : 1,
                    })}
                  >
                    <Text variant="body" numberOfLines={1}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </Card>
            </Animated.View>
          ) : null}
        </Box>
      </Modal>
    </>
  );
}

/**
 * Lista `gap` abaixo do gatilho, com a mesma largura e o mesmo x. Se não
 * couber até o fim da janela, abre `gap` acima.
 */
function placeList(
  anchor: Anchor,
  windowHeight: number,
  { gap, estimatedHeight }: { gap: number; estimatedHeight: number },
) {
  const below = anchor.y + anchor.height + gap;
  const fitsBelow = windowHeight - below >= estimatedHeight;
  return {
    left: anchor.x,
    width: anchor.width,
    ...(fitsBelow ? { top: below } : { bottom: windowHeight - anchor.y + gap }),
  };
}

const styles = StyleSheet.create({
  list: { position: 'absolute' },
});

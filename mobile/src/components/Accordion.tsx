import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../theme';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

type AccordionProps = {
  /** Cabeçalho; o corpo é `${testID}-content`. */
  testID: string;
  accessibilityLabel: string;
  expanded: boolean;
  onToggle: () => void;
  /** Desenha o cabeçalho; recebe o chevron, que gira junto com a altura. */
  renderHeader: (chevron: ReactElement) => ReactNode;
  /** O corpo também faz fade no mesmo progresso da altura (Nota e Faltas). */
  fadeContent?: boolean;
  children: ReactNode;
};

/**
 * Acordeão do Boletim (01-design.md, 2.11 e 4.6). O corpo só é montado na
 * primeira abertura e depois fica montado (fechado, escondido do leitor de
 * tela). Abrir e fechar animam a altura na UI thread: o corpo mede a própria
 * altura (`onLayout`) e o container limita `maxHeight` a `altura × progresso`,
 * com `overflow: hidden`. Aberto e parado, o limite sai, e o corpo acompanha
 * o conteúdo (um acordeão aberto dentro dele) sem esperar outra medida. O
 * chevron gira 0 → 180° no mesmo progresso. Com reduzir movimento, troca sem
 * animar.
 */
export function Accordion({
  testID,
  accessibilityLabel,
  expanded,
  onToggle,
  renderHeader,
  fadeContent = false,
  children,
}: AccordionProps) {
  const { colors, motion, sizes } = useTheme();
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(expanded);
  if (expanded && !mounted) setMounted(true);

  const progress = useSharedValue(expanded ? 1 : 0);
  /** Aberto e com a animação terminada: sem limite de altura. */
  const settled = useSharedValue(expanded);
  const contentHeight = useSharedValue(0);

  useEffect(() => {
    if (expanded) {
      progress.set(
        withTiming(
          1,
          {
            duration: reducedMotion ? 0 : motion.base,
            easing: motion.easeOut,
          },
          finished => {
            'worklet';
            if (finished) settled.set(true);
          },
        ),
      );
    } else {
      settled.set(false);
      progress.set(
        withTiming(0, {
          duration: reducedMotion ? 0 : motion.fast,
          easing: motion.easeIn,
        }),
      );
    }
  }, [expanded, reducedMotion, progress, settled, motion]);

  const { accordionOpenMaxHeight } = sizes;
  const bodyStyle = useAnimatedStyle(() => ({
    maxHeight: settled.get()
      ? accordionOpenMaxHeight
      : contentHeight.get() * progress.get(),
    opacity: fadeContent ? progress.get() : 1,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.get() * motion.chevronOpenDeg}deg` }],
  }));

  const chevron = (
    <Animated.View style={chevronStyle}>
      <ChevronDownIcon color={colors.primary} size={sizes.chevron} />
    </Animated.View>
  );

  return (
    <View>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => ({
          minHeight: sizes.touchTarget,
          justifyContent: 'center',
          opacity: pressed ? motion.pressedOpacity : 1,
        })}
      >
        {renderHeader(chevron)}
      </Pressable>
      {mounted ? (
        <Animated.View
          testID={`${testID}-content`}
          style={[styles.clip, bodyStyle]}
          // Fechado, o corpo continua montado: o leitor de tela não o alcança.
          accessibilityElementsHidden={!expanded}
          importantForAccessibility={expanded ? 'auto' : 'no-hide-descendants'}
        >
          {/* Fica no fluxo com a altura natural (flexShrink 0): é a medida. */}
          <View
            onLayout={event =>
              contentHeight.set(event.nativeEvent.layout.height)
            }
          >
            {children}
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
});

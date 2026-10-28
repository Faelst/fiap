import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { PillButton } from '../../../components/PillButton';
import { strings } from '../../../constants/strings';
import {
  proximityOpacity,
  useActiveLayerStyle,
  useSlidingIndicator,
  type SlidingIndicator,
} from '../../../hooks/useSlidingIndicator';
import { Box, Text, useTheme } from '../../../theme';
import type { AgendaDayItem } from '../useAgendaViewModel';
import { Entrance } from '../../../components/Entrance';

type WeekStripProps = {
  days: AgendaDayItem[];
  selectedIndex: number;
  /** Posição do pager em páginas (UI thread): o indicador segue o dedo. */
  progress: SharedValue<number>;
  onSelect: (index: number) => void;
  monthLabel: string;
  showTodayButton: boolean;
  onPressToday: () => void;
  testID: string;
};

/** Nenhum chip pressionado. */
const NONE = -1;

function usePressScale(pressed: SharedValue<number>, index: number) {
  const { motion } = useTheme();
  const reducedMotion = useReducedMotion();
  return useAnimatedStyle(() => {
    const target =
      !reducedMotion && pressed.get() === index ? motion.pressScaleSmall : 1;
    return { transform: [{ scale: withSpring(target, motion.press) }] };
  });
}

/** Fundo do chip (abaixo do indicador): hoje tem a borda teal. */
function ChipBackground({
  day,
  index,
  pressed,
  style,
}: {
  day: AgendaDayItem;
  index: number;
  pressed: SharedValue<number>;
  style: StyleProp<ViewStyle>;
}) {
  const scale = usePressScale(pressed, index);
  return (
    <Animated.View style={[styles.chip, style, scale]}>
      <Box
        flex={1}
        borderRadius="l"
        borderWidth={1}
        backgroundColor="surfaceRaised"
        borderColor={day.isToday ? 'primary' : 'borderSubtle'}
      />
    </Animated.View>
  );
}

/** Dia da semana, número e ponto "tem aula" numa das duas camadas de cor. */
function ChipContent({
  day,
  onPrimary,
}: {
  day: AgendaDayItem;
  onPrimary: boolean;
}) {
  const { sizes } = useTheme();
  const { dot } = sizes.weekChip;
  return (
    <Box alignItems="center" gap="xs">
      <Text
        variant="overline"
        color={onPrimary ? 'textOnPrimary' : day.isToday ? 'primary' : 'text'}
        maxFontSizeMultiplier={sizes.fixedHeightFontScale}
      >
        {day.weekdayShort}
      </Text>
      <Text
        variant="dayNumber"
        color={onPrimary ? 'textOnPrimary' : 'text'}
        maxFontSizeMultiplier={sizes.fixedHeightFontScale}
      >
        {day.dayNumber}
      </Text>
      <Box width={dot} height={dot}>
        {day.hasLessons ? (
          <Box
            width={dot}
            height={dot}
            borderRadius="pill"
            backgroundColor={onPrimary ? 'textOnPrimary' : 'primary'}
          />
        ) : null}
      </Box>
    </Box>
  );
}

function DayChip({
  day,
  index,
  selected,
  indicator,
  pressed,
  onSelect,
  testID,
}: {
  day: AgendaDayItem;
  index: number;
  selected: boolean;
  indicator: SlidingIndicator;
  pressed: SharedValue<number>;
  onSelect: (index: number) => void;
  testID: string;
}) {
  const scale = usePressScale(pressed, index);
  const activeLayer = useActiveLayerStyle(indicator, index);
  const { position, itemWidth, gap } = indicator;
  const normalLayer = useAnimatedStyle(() => ({
    opacity: 1 - proximityOpacity(position.get(), index, itemWidth, gap),
  }));

  return (
    <Pressable
      testID={testID}
      accessibilityRole="tab"
      accessibilityLabel={day.accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={() => onSelect(index)}
      onPressIn={() => pressed.set(index)}
      onPressOut={() => pressed.set(NONE)}
      style={styles.chip}
    >
      <Animated.View style={[styles.fill, scale]}>
        <Animated.View style={[styles.layer, normalLayer]}>
          <ChipContent day={day} onPrimary={false} />
        </Animated.View>
        <Animated.View style={[styles.layer, activeLayer]}>
          <ChipContent day={day} onPrimary />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Faixa semanal da Agenda (01-design.md da v2, 2.7, V4): o mês, o botão
 * "Hoje" e os 7 dias como chips com a marca de "tem aula". O indicador teal
 * lê a posição do pager (`progress`), então acompanha o dedo durante o
 * swipe, sem mola própria; a cor de cada chip vem da distância até ele.
 */
export function WeekStrip({
  days,
  selectedIndex,
  progress,
  onSelect,
  monthLabel,
  showTodayButton,
  onPressToday,
  testID,
}: WeekStripProps) {
  const { borderRadii, colors, shadows, sizes } = useTheme();
  const { gap, height } = sizes.weekChip;
  const [chipWidth, setChipWidth] = useState(0);
  const pressed = useSharedValue(NONE);
  const indicator = useSlidingIndicator({
    count: days.length,
    itemWidth: chipWidth,
    gap,
    progress,
  });

  const onRowLayout = (event: LayoutChangeEvent) => {
    const count = Math.max(days.length, 1);
    setChipWidth((event.nativeEvent.layout.width - gap * (count - 1)) / count);
  };

  return (
    <Box testID={testID}>
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        minHeight={sizes.pill.xs}
      >
        <Text
          testID="agenda-month-label"
          variant="subtitle"
          accessibilityRole="header"
        >
          {monthLabel}
        </Text>
        {showTodayButton ? (
          <Entrance>
            <PillButton
              testID="agenda-today-button"
              label={strings.agenda.today}
              accessibilityHint={strings.agenda.todayHint}
              variant="ghost"
              size="xs"
              onPress={onPressToday}
            />
          </Entrance>
        ) : null}
      </Box>
      <Box marginTop="s" height={height}>
        <Box
          style={StyleSheet.absoluteFill}
          flexDirection="row"
          gap="xs"
          pointerEvents="none"
        >
          {days.map((day, index) => (
            <ChipBackground
              key={day.date}
              day={day}
              index={index}
              pressed={pressed}
              style={{ height }}
            />
          ))}
        </Box>
        <Animated.View
          testID={`${testID}-indicator`}
          pointerEvents="none"
          style={[
            styles.indicator,
            chipWidth > 0 ? null : styles.hidden,
            {
              width: chipWidth,
              height,
              borderRadius: borderRadii.l,
              backgroundColor: colors.primary,
              boxShadow: [shadows.glowPrimarySoft],
            },
            indicator.indicatorStyle,
          ]}
        />
        <Box
          testID={`${testID}-days`}
          accessibilityRole="tablist"
          flexDirection="row"
          gap="xs"
          height={height}
          onLayout={onRowLayout}
        >
          {days.map((day, index) => (
            <DayChip
              key={day.date}
              day={day}
              index={index}
              selected={index === selectedIndex}
              indicator={indicator}
              pressed={pressed}
              onSelect={onSelect}
              testID={`agenda-day-${day.date}`}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  chip: { flex: 1 },
  fill: { flex: 1 },
  layer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: { position: 'absolute', top: 0, left: 0 },
  hidden: { opacity: 0 },
});

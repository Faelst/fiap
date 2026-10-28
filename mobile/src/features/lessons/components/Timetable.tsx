import { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { strings } from '../../../constants/strings';
import { Box, Card, Text, useTheme } from '../../../theme';
import { formatMinutes, hourMarks } from '../timetable';
import type { AgendaLesson, AgendaPage } from '../useAgendaViewModel';
import { useMinuteTicker } from '../useMinuteClock';
import { AgendaEnter } from './AgendaEnter';

/** Rótulo de hora: metade da linha do `time`, para centralizar na linha. */
const HOUR_LABEL_SHIFT = 7;
/** Rótulos de hora a menos disso da linha de agora somem (ficam sob a marca). */
const LABEL_CLEARANCE = 14;
/** Bloco mais baixo que isso mostra só a disciplina. */
const MIN_BLOCK_WITH_TIME = 40;
/** Vão mais baixo que isso não mostra "Intervalo". */
const MIN_BREAK_LABEL = 20;
/** Respiro entre aulas coladas. */
const BLOCK_GAP = 2;
const NOW_BORDER = 1.5;

export type TimetableClock = {
  minutes: SharedValue<number>;
  now: () => Date;
};

type TimetableProps = {
  page: AgendaPage;
  /** Pontos por hora (2.10): compacto em telas baixas, cresce com a fonte. */
  hourPx: number;
  /** Só na página de hoje: a linha de agora. */
  clock?: TimetableClock;
  /** Atraso base das entradas (cascata depois do banner). */
  enterDelay: number;
  /** Prefixo da página (`agenda-page-<data>`): `-timetable`, `-lesson-<i>`, `-now-line`. */
  testID: string;
};

function HourLabel({
  minute,
  top,
  clock,
  start,
  pxPerMinute,
}: {
  minute: number;
  top: number;
  clock?: TimetableClock;
  start: number;
  pxPerMinute: number;
}) {
  const { motion, sizes } = useTheme();
  const minutes = clock?.minutes;
  const style = useAnimatedStyle(() => {
    if (!minutes) return { opacity: 1 };
    const lineY = (minutes.get() - start) * pxPerMinute;
    const near = Math.abs(lineY - top) < LABEL_CLEARANCE;
    return {
      opacity: withTiming(near ? 0 : 1, { duration: motion.fast }),
    };
  });
  return (
    <Animated.View
      style={[
        styles.hourLabel,
        { top: top - HOUR_LABEL_SHIFT, width: sizes.timetable.gutter },
        style,
      ]}
    >
      <Text variant="time" textAlign="right" paddingRight="s">
        {formatMinutes(minute)}
      </Text>
    </Animated.View>
  );
}

function LessonBlock({
  lesson,
  top,
  height,
  index,
  enterDelay,
  testID,
}: {
  lesson: AgendaLesson;
  top: number;
  height: number;
  index: number;
  enterDelay: number;
  testID: string;
}) {
  const { motion, opacities, shadows, sizes, borderRadii, colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const isNow = lesson.state === 'now';
  const isPast = lesson.state === 'past';
  const dim = useSharedValue(isPast ? opacities.past : 1);
  const glow = useSharedValue(isNow ? 1 : 0);
  const firstState = useRef(lesson.state);

  useEffect(() => {
    // Na montagem já nasce no estado; só a mudança de fase anima.
    if (firstState.current === lesson.state) return;
    firstState.current = lesson.state;
    const target = isPast ? opacities.past : 1;
    dim.set(
      reducedMotion ? target : withTiming(target, { duration: motion.slow }),
    );
    glow.set(withTiming(isNow ? 1 : 0, { duration: motion.base }));
  }, [
    lesson.state,
    isNow,
    isPast,
    dim,
    glow,
    motion,
    opacities,
    reducedMotion,
  ]);

  const dimStyle = useAnimatedStyle(() => ({ opacity: dim.get() }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.get() }));
  const compact = height < MIN_BLOCK_WITH_TIME;
  const delay =
    enterDelay + Math.min(index, motion.maxStaggered) * motion.stagger;

  return (
    <AgendaEnter
      delay={delay}
      style={[styles.block, { top, height, left: sizes.timetable.gutter }]}
    >
      <Animated.View style={[styles.fill, dimStyle]}>
        <Card
          testID={testID}
          variant="lesson"
          flex={1}
          paddingVertical={compact ? 'none' : { compact: 'xs', phone: 's' }}
          justifyContent={compact ? 'center' : 'flex-start'}
          accessible
          accessibilityRole="text"
          accessibilityLabel={lesson.accessibilityLabel}
        >
          <Box flexDirection="row" alignItems="flex-start" gap="s">
            <Text
              testID={`${testID}-subject`}
              variant="subtitle"
              numberOfLines={1}
              flex={1}
            >
              {lesson.subject}
            </Text>
            {isNow ? <NowBadge testID={`${testID}-now-badge`} /> : null}
          </Box>
          {compact ? null : (
            <Text
              testID={`${testID}-time`}
              variant="caption"
              marginTop="xxs"
              numberOfLines={1}
              style={styles.tabular}
            >
              {lesson.timeLabel}
            </Text>
          )}
        </Card>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: borderRadii.s,
              borderWidth: NOW_BORDER,
              borderColor: colors.primary,
              boxShadow: [shadows.glowPrimary],
            },
            glowStyle,
          ]}
        />
      </Animated.View>
    </AgendaEnter>
  );
}

/** Selo "Agora": cresce de `popFrom` com a mola `pop` (fade com reduzir movimento). */
function NowBadge({ testID }: { testID: string }) {
  const { motion, sizes } = useTheme();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.set(
      reducedMotion
        ? withTiming(1, { duration: motion.fast })
        : withSpring(1, motion.spring.pop),
    );
  }, [progress, reducedMotion, motion]);
  const style = useAnimatedStyle(() => ({
    opacity: Math.min(progress.get(), 1),
    transform: [
      {
        scale: reducedMotion
          ? 1
          : motion.popFrom + (1 - motion.popFrom) * progress.get(),
      },
    ],
  }));
  return (
    <Animated.View style={style}>
      <Box
        testID={testID}
        height={sizes.timetable.nowLabel}
        paddingHorizontal="s"
        borderRadius="pill"
        backgroundColor="primary"
        justifyContent="center"
      >
        <Text
          variant="overline"
          color="textOnPrimary"
          maxFontSizeMultiplier={sizes.fixedHeightFontScale}
        >
          {strings.agenda.nowBadge}
        </Text>
      </Box>
    </Animated.View>
  );
}

/** Marca `HH:MM` da linha: o único pedaço que re-renderiza a cada minuto. */
function NowTimeLabel({ now }: { now: () => Date }) {
  const { sizes } = useTheme();
  const read = () => {
    const date = now();
    return formatMinutes(date.getHours() * 60 + date.getMinutes());
  };
  const [label, setLabel] = useState(read);
  useMinuteTicker(now, () => setLabel(read()));
  return (
    <Text
      variant="time"
      color="textOnPrimary"
      maxFontSizeMultiplier={sizes.fixedHeightFontScale}
    >
      {label}
    </Text>
  );
}

/**
 * Linha de agora (2.10): ponto com anel, linha teal com brilho e a marca da
 * hora na calha. Anda com `translateY` lido do relógio (UI thread) e some
 * fora da faixa da grade (aí o banner dá o texto).
 */
function NowLine({
  clock,
  start,
  end,
  pxPerMinute,
  enterDelay,
  testID,
}: {
  clock: TimetableClock;
  start: number;
  end: number;
  pxPerMinute: number;
  enterDelay: number;
  testID: string;
}) {
  const { colors, motion, shadows, sizes } = useTheme();
  const reducedMotion = useReducedMotion();
  const { gutter, nowDot, nowLine, nowLabel } = sizes.timetable;
  const reveal = useSharedValue(0);
  const { minutes } = clock;

  useEffect(() => {
    // Depois dos blocos (4.4).
    const after = enterDelay + motion.maxStaggered * motion.stagger;
    reveal.set(
      reducedMotion
        ? withTiming(1, { duration: motion.fast })
        : withDelay(
            after,
            withTiming(1, { duration: motion.slow, easing: motion.emphasized }),
          ),
    );
  }, [reveal, reducedMotion, motion, enterDelay]);

  const lineStyle = useAnimatedStyle(() => {
    const m = minutes.get();
    const inside = m >= start && m <= end;
    return {
      opacity: inside ? reveal.get() : 0,
      transform: [
        {
          translateY: (Math.min(Math.max(m, start), end) - start) * pxPerMinute,
        },
      ],
    };
  });
  const barStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: reducedMotion ? 1 : reveal.get() }],
  }));

  return (
    <Animated.View
      testID={testID}
      pointerEvents="none"
      style={[
        styles.nowLine,
        { height: nowLabel, top: -nowLabel / 2 },
        lineStyle,
      ]}
    >
      <Box
        position="absolute"
        left={0}
        height={nowLabel}
        justifyContent="center"
      >
        <Box
          height={nowLabel}
          paddingHorizontal="xs"
          borderRadius="pill"
          backgroundColor="primary"
          justifyContent="center"
        >
          <NowTimeLabel now={clock.now} />
        </Box>
      </Box>
      <Animated.View
        style={[
          styles.nowBar,
          {
            left: gutter,
            height: nowLine,
            top: (nowLabel - nowLine) / 2,
            backgroundColor: colors.primary,
            boxShadow: [shadows.glowPrimarySoft],
          },
          barStyle,
        ]}
      />
      <Box
        position="absolute"
        left={gutter - nowDot / 2}
        top={(nowLabel - nowDot) / 2}
        width={nowDot}
        height={nowDot}
        borderRadius="pill"
        backgroundColor="primary"
      />
    </Animated.View>
  );
}

/**
 * Grade por hora do dia (01-design.md da v2, 2.10, V5): blocos proporcionais
 * à duração, linhas de hora, intervalos marcados e, hoje, a linha de agora
 * e os estados das aulas (agora, passadas). Linhas, horas, intervalo e a
 * linha de agora ficam escondidos do leitor; ele lê só os blocos, em ordem.
 */
export const Timetable = memo(function TimetableView({
  page,
  hourPx,
  clock,
  enterDelay,
  testID,
}: TimetableProps) {
  const { sizes } = useTheme();
  const { range } = page;
  if (!range) return null;
  const pxPerMinute = hourPx / 60;
  const height = (range.end - range.start) * pxPerMinute;
  const y = (minute: number) => (minute - range.start) * pxPerMinute;
  const { gutter } = sizes.timetable;

  return (
    <Box testID={`${testID}-timetable`} height={height}>
      <Box
        style={StyleSheet.absoluteFill}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        {hourMarks(range).map(minute => (
          <Box
            key={minute}
            position="absolute"
            left={gutter}
            right={0}
            top={y(minute)}
            height={StyleSheet.hairlineWidth}
            backgroundColor="borderSubtle"
          />
        ))}
        {hourMarks(range).map(minute => (
          <HourLabel
            key={minute}
            minute={minute}
            top={y(minute)}
            clock={clock}
            start={range.start}
            pxPerMinute={pxPerMinute}
          />
        ))}
        {page.breaks.map(gap => {
          const gapHeight = (gap.endMinutes - gap.startMinutes) * pxPerMinute;
          if (gapHeight < MIN_BREAK_LABEL) return null;
          return (
            <Box
              key={gap.startMinutes}
              position="absolute"
              left={gutter}
              right={0}
              top={y(gap.startMinutes)}
              height={gapHeight}
              alignItems="center"
              justifyContent="center"
            >
              <Text variant="caption" color="textTertiary">
                {strings.agenda.break(gap.minutes)}
              </Text>
            </Box>
          );
        })}
      </Box>
      {page.lessons.map((lesson, index) => (
        <LessonBlock
          key={lesson.key}
          lesson={lesson}
          index={index}
          top={y(lesson.startMinutes) + BLOCK_GAP / 2}
          height={
            (lesson.endMinutes - lesson.startMinutes) * pxPerMinute - BLOCK_GAP
          }
          enterDelay={enterDelay}
          testID={`${testID}-lesson-${index}`}
        />
      ))}
      {clock ? (
        <NowLine
          clock={clock}
          start={range.start}
          end={range.end}
          pxPerMinute={pxPerMinute}
          enterDelay={enterDelay}
          testID={`${testID}-now-line`}
        />
      ) : null}
    </Box>
  );
});

const styles = StyleSheet.create({
  fill: { flex: 1 },
  block: { position: 'absolute', right: 0 },
  hourLabel: { position: 'absolute', left: 0 },
  nowLine: { position: 'absolute', left: 0, right: 0, zIndex: 2 },
  nowBar: { position: 'absolute', right: 0, transformOrigin: 'left' },
  tabular: { fontVariant: ['tabular-nums'] },
});

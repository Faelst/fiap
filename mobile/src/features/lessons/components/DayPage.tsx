import { memo, useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  type LayoutChangeEvent,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { EmptyState } from '../../../components/EmptyState';
import { CalendarOffIcon } from '../../../components/icons/CalendarOffIcon';
import { strings } from '../../../constants/strings';
import { Box, useTheme } from '../../../theme';
import { autoScrollTarget, minutesOfDay } from '../timetable';
import type { AgendaPage } from '../useAgendaViewModel';
import { Entrance } from '../../../components/Entrance';
import { NowBanner } from './NowBanner';
import { Timetable, type TimetableClock } from './Timetable';

type DayPageProps = {
  page: AgendaPage;
  width: number;
  hourPx: number;
  /** Só na página de hoje. */
  clock?: TimetableClock;
  /** Página visível: o banner de hoje anuncia a troca de fase. */
  visible: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  bottomInset: number;
  enterDelay: number;
  /** `agenda-page-<data>`: a rolagem; os filhos derivam dele. */
  testID: string;
};

/**
 * Uma página do pager (01-design.md da v2, 2.9): rolagem vertical com o
 * banner e a grade, ou o estado vazio do dia. Na página de hoje, rola uma
 * vez até a linha de agora quando ela começa fora da área visível.
 */
export const DayPage = memo(function DayPageView({
  page,
  width,
  hourPx,
  clock,
  visible,
  refreshing,
  onRefresh,
  bottomInset,
  enterDelay,
  testID,
}: DayPageProps) {
  const { colors, motion, sizes, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [timetableY, setTimetableY] = useState<number | null>(null);
  const scrolled = useRef(false);

  useEffect(() => {
    if (!clock || !page.range || scrolled.current) return;
    if (viewportHeight <= 0 || timetableY === null) return;
    const minute = minutesOfDay(clock.now());
    const lineY = timetableY + ((minute - page.range.start) * hourPx) / 60;
    const inside = minute >= page.range.start && minute <= page.range.end;
    const target = inside
      ? autoScrollTarget(
          lineY,
          viewportHeight - bottomInset,
          sizes.timetable.autoScrollAnchor,
        )
      : null;
    if (target === null) {
      scrolled.current = true;
      return;
    }
    // Depois da entrada dos blocos (4.4); uma vez por montagem.
    const wait = reducedMotion
      ? 0
      : enterDelay + motion.maxStaggered * motion.stagger + motion.base;
    const timer = setTimeout(() => {
      scrolled.current = true;
      scrollRef.current?.scrollTo({ y: target, animated: !reducedMotion });
    }, wait);
    return () => clearTimeout(timer);
  }, [
    clock,
    page.range,
    viewportHeight,
    timetableY,
    hourPx,
    bottomInset,
    reducedMotion,
    enterDelay,
    motion,
    sizes.timetable.autoScrollAnchor,
  ]);

  const empty = page.lessons.length === 0;

  return (
    <ScrollView
      ref={scrollRef}
      testID={testID}
      style={{ width }}
      contentContainerStyle={[
        styles.content,
        {
          paddingHorizontal: spacing.m,
          paddingTop: spacing.m,
          paddingBottom: bottomInset,
        },
      ]}
      scrollIndicatorInsets={{ bottom: bottomInset }}
      showsVerticalScrollIndicator={false}
      onLayout={(event: LayoutChangeEvent) =>
        setViewportHeight(event.nativeEvent.layout.height)
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.surfaceRaised}
        />
      }
    >
      {empty ? (
        <EmptyState
          testID={`${testID}-empty`}
          icon={CalendarOffIcon}
          title={strings.agenda.empty}
          description={page.emptyDescription}
        />
      ) : (
        <>
          {page.banner ? (
            <Entrance delay={enterDelay} offsetY={motion.enterOffsetSmall}>
              <NowBanner
                testID={`${testID}-banner`}
                banner={page.banner}
                announce={page.isToday && visible}
              />
            </Entrance>
          ) : null}
          <Box
            marginTop="m"
            onLayout={(event: LayoutChangeEvent) =>
              setTimetableY(event.nativeEvent.layout.y)
            }
          >
            <Timetable
              testID={testID}
              page={page}
              hourPx={hourPx}
              clock={clock}
              enterDelay={enterDelay + motion.stagger}
            />
          </Box>
        </>
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
});

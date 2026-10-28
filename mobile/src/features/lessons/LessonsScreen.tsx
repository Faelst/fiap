import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  useWindowDimensions,
  type FlatList,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

import { AgendaSkeleton } from '../../components/AgendaSkeleton';
import { CompactHeader } from '../../components/CompactHeader';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { CalendarOffIcon } from '../../components/icons/CalendarOffIcon';
import { Screen } from '../../components/Screen';
import { strings } from '../../constants/strings';
import { useFloatingTabBarInset } from '../../hooks/useFloatingTabBarInset';
import { Box, useTheme } from '../../theme';
import { useHeaderViewModel } from '../header/useHeaderViewModel';
import { AgendaEnter } from './components/AgendaEnter';
import { DayPage } from './components/DayPage';
import type { TimetableClock } from './components/Timetable';
import { WeekStrip } from './components/WeekStrip';
import { hourHeight } from './timetable';
import { useAgendaViewModel, type AgendaPage } from './useAgendaViewModel';

/** Um evento de rolagem por quadro: o indicador da faixa segue o dedo. */
const SCROLL_THROTTLE = 16;

/**
 * Agenda (01-design.md da v2, 3.3, V4/V5): header compacto, a faixa
 * semanal e um pager horizontal com uma página por dia (swipe nativo, sem
 * gesture-handler). A posição do pager vai para um shared value na UI
 * thread, lido pelo indicador da faixa. Tocar num chip escolhe o dia antes
 * de rolar o pager, então o estado já fica certo durante a rolagem.
 */
export function LessonsScreen() {
  const vm = useAgendaViewModel();
  const header = useHeaderViewModel(useNavigation());
  // As abas ficam montadas: só a visível anuncia o erro (3.8).
  const isFocused = useIsFocused();
  const { breakpoints, motion, sizes, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const bottomInset = useFloatingTabBarInset();
  const window = useWindowDimensions();
  const [width, setWidth] = useState(
    Math.min(window.width, sizes.contentMaxWidth),
  );
  const hourPx = hourHeight(window.height, window.fontScale, sizes.timetable);
  const listRef = useRef<FlatList<AgendaPage>>(null);
  const progress = useSharedValue(Math.max(vm.selectedIndex, 0));

  const { days, selectedIndex, onSelectDay, now, clockMinutes } = vm;

  // Pager novo (outro aluno) ou largura nova: o indicador volta ao dia.
  useEffect(() => {
    progress.set(Math.max(selectedIndex, 0));
    // Só quando o pager remonta ou mede de novo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vm.studentKey, width]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: event => {
      if (width > 0) progress.set(event.contentOffset.x / width);
    },
  });

  const scrollToIndex = useCallback(
    (index: number) =>
      listRef.current?.scrollToIndex({ index, animated: !reducedMotion }),
    [reducedMotion],
  );

  const onSelectChip = useCallback(
    (index: number) => {
      const day = days[index];
      if (!day) return;
      onSelectDay(day.date);
      scrollToIndex(index);
    },
    [days, onSelectDay, scrollToIndex],
  );

  const onPressToday = () => {
    vm.onSelectToday();
    scrollToIndex(vm.todayIndex);
  };

  const onMomentumScrollEnd = async (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (width <= 0) return;
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    const day = days[index];
    if (!day || index === selectedIndex) return;
    onSelectDay(day.date);
    if (await AccessibilityInfo.isScreenReaderEnabled()) {
      AccessibilityInfo.announceForAccessibility(day.announcement);
    }
  };

  const onPagerLayout = (event: LayoutChangeEvent) => {
    const measured = event.nativeEvent.layout.width;
    if (measured > 0 && measured !== width) setWidth(measured);
  };

  const clock = useMemo<TimetableClock>(
    () => ({ minutes: clockMinutes, now }),
    [clockMinutes, now],
  );

  // A 1ª entrada espera o header (4.3/4.4).
  const enterDelay = 3 * motion.stagger;

  const renderItem = ({ item, index }: { item: AgendaPage; index: number }) => (
    <DayPage
      testID={`agenda-page-${item.date}`}
      page={item}
      width={width}
      hourPx={hourPx}
      clock={item.isToday ? clock : undefined}
      visible={index === selectedIndex}
      refreshing={vm.refreshing}
      onRefresh={vm.onRefresh}
      bottomInset={bottomInset}
      enterDelay={enterDelay}
    />
  );

  return (
    <Screen testID="agenda-screen">
      <CompactHeader
        title={strings.agenda.title}
        titleTestID="agenda-title"
        guardianFirstName={header.guardianFirstName}
        student={header.student}
        onPressStudent={header.onPressStudent}
      />
      <Box flex={1} marginTop="sm">
        {vm.status === 'loading' ? (
          <AgendaSkeleton testID="agenda-skeleton" />
        ) : null}
        {vm.status === 'error' ? (
          <ErrorState
            testID="agenda-error"
            title={strings.agenda.error.title}
            description={strings.common.error.description}
            onRetry={vm.onRetry}
            retrying={vm.retrying}
            shakeKey={vm.shakeKey}
            announce={isFocused}
          />
        ) : null}
        {vm.isWeekEmpty ? (
          <EmptyState
            testID="agenda-week-empty"
            icon={CalendarOffIcon}
            title={strings.agenda.weekEmpty}
          />
        ) : null}
        {vm.status === 'ready' && !vm.isWeekEmpty ? (
          <>
            <AgendaEnter
              key={`strip-${vm.studentKey}`}
              delay={motion.stagger}
              style={{
                paddingHorizontal:
                  window.width < breakpoints.phone ? spacing.s : spacing.m,
                marginBottom: spacing.xs,
              }}
            >
              <WeekStrip
                testID="agenda-week-strip"
                days={days}
                selectedIndex={selectedIndex}
                progress={progress}
                onSelect={onSelectChip}
                monthLabel={vm.monthLabel}
                showTodayButton={vm.showTodayButton}
                onPressToday={onPressToday}
              />
            </AgendaEnter>
            <Box flex={1} onLayout={onPagerLayout}>
              <Animated.FlatList
                key={`pager-${vm.studentKey}-${width}`}
                ref={listRef}
                testID="agenda-pager"
                data={vm.pages}
                keyExtractor={page => page.date}
                renderItem={renderItem}
                extraData={`${selectedIndex}:${vm.refreshing}:${hourPx}`}
                horizontal
                pagingEnabled
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={Math.max(selectedIndex, 0)}
                getItemLayout={(_, index) => ({
                  length: width,
                  offset: width * index,
                  index,
                })}
                windowSize={3}
                initialNumToRender={1}
                onScroll={onScroll}
                scrollEventThrottle={SCROLL_THROTTLE}
                onMomentumScrollEnd={onMomentumScrollEnd}
              />
            </Box>
          </>
        ) : null}
      </Box>
    </Screen>
  );
}

import { useState } from 'react';
import Animated, {
  FadeInDown,
  FadeOut,
  ReduceMotion,
} from 'react-native-reanimated';

import { AgendaSkeleton } from '../../components/AgendaSkeleton';
import { Dropdown } from '../../components/Dropdown';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LessonItem } from '../../components/LessonItem';
import { Screen } from '../../components/Screen';
import { SectionTitle } from '../../components/SectionTitle';
import { strings } from '../../constants/strings';
import { Box, useTheme } from '../../theme';
import { AppHeader } from '../header/AppHeader';
import { useAgendaViewModel } from './useAgendaViewModel';

/**
 * Agenda (M4, 01-design.md 3.3 e 4.5): título, dropdown dos dias e as aulas
 * do dia, o estado vazio, o skeleton ou o erro. As aulas são no máximo
 * algumas por dia e rolam junto com o Header (que já é a `ScrollView`), por
 * isso um `map`, e não uma `FlatList` aninhada.
 */
export function LessonsScreen() {
  const vm = useAgendaViewModel();
  const { motion, spacing } = useTheme();

  // A 1ª lista espera a entrada do header (4.3); as seguintes, não.
  const [firstContentKey, setFirstContentKey] = useState<string | null>(null);
  if (vm.status === 'ready' && firstContentKey === null) {
    setFirstContentKey(vm.contentKey);
  }
  const contentDelay =
    vm.contentKey === firstContentKey ? 4 * motion.stagger : 0;

  const enterDown = (delay: number) =>
    FadeInDown.duration(motion.base)
      .delay(delay)
      .easing(motion.easeOut)
      .withInitialValues({
        transform: [{ translateY: motion.enterOffsetSmall }],
      })
      .reduceMotion(ReduceMotion.System);

  return (
    <Screen testID="agenda-screen">
      <AppHeader>
        <Animated.View
          entering={enterDown(2 * motion.stagger)}
          style={{ marginTop: spacing.section }}
        >
          <SectionTitle
            testID="agenda-title"
            title={strings.agenda.title}
            accessibilityLabel={strings.agenda.titleAccessibilityLabel}
          />
        </Animated.View>
        <Box marginTop="m" paddingBottom="l">
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
            />
          ) : null}
          {vm.status === 'ready' ? (
            <>
              <Animated.View entering={enterDown(3 * motion.stagger)}>
                <Dropdown
                  testID="agenda-day-dropdown"
                  label={vm.selectedDayLabel}
                  options={vm.dayOptions}
                  selectedKey={vm.selectedDate}
                  onSelect={vm.onSelectDay}
                  accessibilityLabelPrefix={
                    strings.agenda.dayAccessibilityPrefix
                  }
                  accessibilityHint={strings.agenda.dayHint}
                  marginHorizontal="l"
                />
              </Animated.View>
              <Animated.View
                key={vm.contentKey}
                exiting={FadeOut.duration(motion.exitFast)
                  .easing(motion.easeIn)
                  .reduceMotion(ReduceMotion.System)}
                style={{ marginTop: spacing.l }}
              >
                {vm.isEmpty ? (
                  <EmptyState
                    testID="agenda-empty"
                    title={strings.agenda.empty}
                  />
                ) : (
                  <Box
                    testID="agenda-lesson-list"
                    paddingHorizontal="xxxl"
                    gap="m"
                  >
                    {vm.lessons.map((lesson, index) => (
                      <LessonItem
                        key={lesson.key}
                        testID={`agenda-lesson-${index}`}
                        index={index}
                        enterDelay={contentDelay}
                        startTime={lesson.startTime}
                        endTime={lesson.endTime}
                        subject={lesson.subject}
                      />
                    ))}
                  </Box>
                )}
              </Animated.View>
            </>
          ) : null}
        </Box>
      </AppHeader>
    </Screen>
  );
}

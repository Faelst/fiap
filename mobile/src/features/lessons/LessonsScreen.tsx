import { useIsFocused } from '@react-navigation/native';
import Animated, { FadeOut, ReduceMotion } from 'react-native-reanimated';

import { AgendaSkeleton } from '../../components/AgendaSkeleton';
import { Dropdown } from '../../components/Dropdown';
import { EmptyState } from '../../components/EmptyState';
import { CalendarOffIcon } from '../../components/icons/CalendarOffIcon';
import { ErrorState } from '../../components/ErrorState';
import { LessonItem } from '../../components/LessonItem';
import { Screen } from '../../components/Screen';
import { strings } from '../../constants/strings';
import { Box, enterDown, useTheme } from '../../theme';
import { TabScreenLayout } from '../header/TabScreenLayout';
import { useAgendaViewModel } from './useAgendaViewModel';

/**
 * Agenda (M4, 01-design.md 3.3 e 4.5): header compacto (v2, 2.6), dropdown
 * dos dias e as aulas do dia, o estado vazio, o skeleton ou o erro. As
 * aulas são no máximo algumas por dia e rolam na `ScrollView` do layout das
 * abas, por isso um `map`, e não uma `FlatList` aninhada.
 */
export function LessonsScreen() {
  const vm = useAgendaViewModel();
  // As abas ficam montadas: só a visível anuncia o erro (3.8).
  const isFocused = useIsFocused();
  const { motion, spacing } = useTheme();

  return (
    <Screen testID="agenda-screen">
      <TabScreenLayout
        title={strings.agenda.title}
        titleTestID="agenda-title"
        scrollTestID="agenda-scroll"
      >
        <Box marginTop="sm" paddingBottom="l">
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
          {vm.status === 'ready' ? (
            <>
              {vm.dayOptions.length > 0 ? (
                <Animated.View entering={enterDown(motion, 3 * motion.stagger)}>
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
              ) : null}
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
                    icon={CalendarOffIcon}
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
                        enterDelay={vm.contentEnterDelay}
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
      </TabScreenLayout>
    </Screen>
  );
}

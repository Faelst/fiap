import { useIsFocused } from '@react-navigation/native';
import Animated, { FadeOut, ReduceMotion } from 'react-native-reanimated';

import { BoletimSkeleton } from '../../components/BoletimSkeleton';
import { Dropdown } from '../../components/Dropdown';
import { EmptyState } from '../../components/EmptyState';
import { ClockIcon } from '../../components/icons/ClockIcon';
import { ErrorState } from '../../components/ErrorState';
import { Screen } from '../../components/Screen';
import { strings } from '../../constants/strings';
import { Box, enterDown, useTheme } from '../../theme';
import { TabScreenLayout } from '../header/TabScreenLayout';
import { TermAccordion } from './components/TermAccordion';
import { useReportCardViewModel } from './useReportCardViewModel';

/**
 * Boletim (M5, 01-design.md 3.4 e 4.6): header compacto (v2, 2.6), dropdown
 * de turma e ano e os trimestres do ano em acordeão, o skeleton ou o erro.
 * Rola na `ScrollView` do layout das abas, por isso um `map`: são 3
 * trimestres de até 12 disciplinas, e o corpo de cada acordeão só monta na
 * 1ª abertura.
 */
export function ReportCardScreen() {
  const vm = useReportCardViewModel();
  // As abas ficam montadas: só a visível anuncia o erro (3.8).
  const isFocused = useIsFocused();
  const { motion, spacing } = useTheme();

  const errorState = (
    <ErrorState
      testID="boletim-error"
      title={strings.boletim.error.title}
      description={vm.errorDescription}
      onRetry={vm.onRetry}
      retrying={vm.retrying}
      shakeKey={vm.shakeKey}
      announce={isFocused}
    />
  );

  return (
    <Screen testID="boletim-screen">
      <TabScreenLayout
        title={strings.boletim.title}
        titleTestID="boletim-title"
        scrollTestID="boletim-scroll"
      >
        <Box marginTop="sm" paddingBottom="l">
          {vm.status === 'loading' ? (
            <BoletimSkeleton testID="boletim-skeleton" />
          ) : null}
          {vm.status === 'error' ? errorState : null}
          {vm.status === 'ready' && vm.isEmpty ? (
            <EmptyState
              testID="boletim-empty"
              icon={ClockIcon}
              title={strings.boletim.empty}
            />
          ) : null}
          {vm.status === 'ready' && !vm.isEmpty ? (
            <>
              <Animated.View entering={enterDown(motion, 3 * motion.stagger)}>
                <Dropdown
                  testID="boletim-year-dropdown"
                  label={vm.selectedYearLabel}
                  options={vm.yearOptions}
                  selectedKey={vm.selectedYearKey}
                  onSelect={vm.onSelectYear}
                  accessibilityLabelPrefix={
                    strings.boletim.yearAccessibilityPrefix
                  }
                  accessibilityHint={strings.boletim.yearHint}
                  marginHorizontal="m"
                />
              </Animated.View>
              <Box marginTop="m">
                {vm.termsStatus === 'loading' ? (
                  <BoletimSkeleton
                    testID="boletim-skeleton"
                    withDropdown={false}
                  />
                ) : null}
                {vm.termsStatus === 'error' ? errorState : null}
                {vm.termsStatus === 'ready' ? (
                  <Animated.View
                    key={vm.contentKey}
                    exiting={FadeOut.duration(motion.exitFast)
                      .easing(motion.easeIn)
                      .reduceMotion(ReduceMotion.System)}
                    style={{ gap: spacing.m }}
                  >
                    {vm.terms.map((term, index) => (
                      <Animated.View
                        key={term.term}
                        entering={enterDown(
                          motion,
                          vm.contentEnterDelay + index * motion.cardStagger,
                        )}
                      >
                        <TermAccordion
                          testID={`boletim-term-${term.term}`}
                          term={term}
                          onToggle={() => vm.onToggleTerm(term.term)}
                          onToggleSubject={subjectIndex =>
                            vm.onToggleSubject(term.term, subjectIndex)
                          }
                        />
                      </Animated.View>
                    ))}
                  </Animated.View>
                ) : null}
              </Box>
            </>
          ) : null}
        </Box>
      </TabScreenLayout>
    </Screen>
  );
}

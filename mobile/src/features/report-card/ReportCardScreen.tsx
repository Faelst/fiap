import Animated, {
  FadeInDown,
  FadeOut,
  ReduceMotion,
} from 'react-native-reanimated';

import { BoletimSkeleton } from '../../components/BoletimSkeleton';
import { Dropdown } from '../../components/Dropdown';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { Screen } from '../../components/Screen';
import { SectionTitle } from '../../components/SectionTitle';
import { strings } from '../../constants/strings';
import { Box, useTheme } from '../../theme';
import { AppHeader } from '../header/AppHeader';
import { TermAccordion } from './components/TermAccordion';
import { useReportCardViewModel } from './useReportCardViewModel';

/**
 * Boletim (M5, 01-design.md 3.4 e 4.6): título, dropdown de turma e ano e os
 * trimestres do ano em acordeão, o skeleton ou o erro. Rola junto com o
 * Header (que já é a `ScrollView`), por isso um `map`: são 3 trimestres de
 * até 12 disciplinas, e o corpo de cada acordeão só monta na 1ª abertura.
 */
export function ReportCardScreen() {
  const vm = useReportCardViewModel();
  const { motion, spacing } = useTheme();

  const enterDown = (delay: number) =>
    FadeInDown.duration(motion.base)
      .delay(delay)
      .easing(motion.easeOut)
      .withInitialValues({
        transform: [{ translateY: motion.enterOffsetSmall }],
      })
      .reduceMotion(ReduceMotion.System);

  const errorState = (
    <ErrorState
      testID="boletim-error"
      title={strings.boletim.error.title}
      description={vm.errorDescription}
      onRetry={vm.onRetry}
      retrying={vm.retrying}
      shakeKey={vm.shakeKey}
    />
  );

  return (
    <Screen testID="boletim-screen">
      <AppHeader>
        <Animated.View
          entering={enterDown(2 * motion.stagger)}
          style={{ marginTop: spacing.section }}
        >
          <SectionTitle
            testID="boletim-title"
            title={strings.boletim.title}
            accessibilityLabel={strings.boletim.titleAccessibilityLabel}
          />
        </Animated.View>
        <Box marginTop="m" paddingBottom="l">
          {vm.status === 'loading' ? (
            <BoletimSkeleton testID="boletim-skeleton" />
          ) : null}
          {vm.status === 'error' ? errorState : null}
          {vm.status === 'ready' && vm.isEmpty ? (
            <EmptyState
              testID="boletim-empty"
              title={strings.boletim.empty}
              illustration={false}
            />
          ) : null}
          {vm.status === 'ready' && !vm.isEmpty ? (
            <>
              <Animated.View entering={enterDown(3 * motion.stagger)}>
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
      </AppHeader>
    </Screen>
  );
}

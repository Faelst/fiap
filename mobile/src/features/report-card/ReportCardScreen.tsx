import { useIsFocused } from '@react-navigation/native';
import { RefreshControl } from 'react-native';

import { BoletimSkeleton } from '../../components/BoletimSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Entrance } from '../../components/Entrance';
import { ClockIcon } from '../../components/icons/ClockIcon';
import { ErrorState } from '../../components/ErrorState';
import { Screen } from '../../components/Screen';
import { SegmentedControl } from '../../components/SegmentedControl';
import { strings } from '../../constants/strings';
import { Box, Text, useTheme } from '../../theme';
import { TabScreenLayout } from '../header/TabScreenLayout';
import { GradeLegend } from './components/GradeLegend';
import { SubjectGradeCard } from './components/SubjectGradeCard';
import { TermSummaryCard } from './components/TermSummaryCard';
import { useReportCardViewModel } from './useReportCardViewModel';

/**
 * Boletim v2 (01-design.md da v2, 3.4 e 4.5): o ano e o trimestre em
 * segmentos, o resumo do trimestre com a legenda e as disciplinas em cards
 * abertos (sem acordeão), ou o skeleton, o erro e os estados vazios. Tudo o
 * que monta depois dos dados entra por valor animado (`Entrance`), não por
 * animação de layout. Um `map`: são até 12 cards (o stagger para no 6º).
 */
export function ReportCardScreen() {
  const vm = useReportCardViewModel();
  // As abas ficam montadas: só a visível anuncia o erro (3.8).
  const isFocused = useIsFocused();
  const { colors, motion } = useTheme();
  const segmentsDelay = 3 * motion.stagger;
  const cardDelay = (index: number) =>
    vm.contentEnterDelay +
    Math.min(index, motion.maxStaggered) * motion.subjectStagger;

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
        refreshControl={
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surfaceRaised}
          />
        }
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
              <Box paddingHorizontal="m">
                <Entrance
                  delay={segmentsDelay}
                  offsetY={motion.enterOffsetSmall}
                >
                  <SegmentedControl
                    testID="boletim-year"
                    size="sm"
                    options={vm.yearOptions}
                    selectedKey={vm.selectedYearKey}
                    onChange={vm.onSelectYear}
                  />
                </Entrance>
              </Box>
              <Box marginTop="sm">
                {vm.termsStatus === 'loading' ? (
                  <BoletimSkeleton testID="boletim-skeleton" withYear={false} />
                ) : null}
                {vm.termsStatus === 'error' ? errorState : null}
                {vm.termsStatus === 'ready' ? (
                  <Box paddingHorizontal="m">
                    <Entrance
                      delay={segmentsDelay}
                      offsetY={motion.enterOffsetSmall}
                    >
                      <SegmentedControl
                        testID="boletim-term-tab"
                        options={vm.termOptions}
                        selectedKey={vm.selectedTermKey}
                        onChange={vm.onSelectTerm}
                      />
                    </Entrance>
                    <Box key={vm.contentKey} marginTop="m">
                      {vm.summary?.evaluated ? (
                        <>
                          <Entrance
                            delay={vm.contentEnterDelay}
                            offsetX={vm.slideDirection * motion.slideOffset}
                            easing={motion.emphasized}
                          >
                            <TermSummaryCard
                              testID="boletim-summary"
                              summary={vm.summary}
                              barDelay={vm.contentEnterDelay + motion.base}
                            />
                            <GradeLegend testID="boletim-legend" />
                          </Entrance>
                          <Text
                            variant="overline"
                            marginTop="l"
                            marginBottom="s"
                            accessibilityRole="header"
                          >
                            {vm.subjectsHeader}
                          </Text>
                          <Box gap="s">
                            {vm.subjects.map(subject => (
                              <Entrance
                                key={subject.key}
                                delay={cardDelay(subject.index)}
                                offsetY={motion.enterOffsetSmall}
                              >
                                <SubjectGradeCard
                                  testID={`boletim-term-${vm.selectedTerm}-subject-${subject.index}`}
                                  subject={subject}
                                  barDelay={
                                    cardDelay(subject.index) + motion.fast
                                  }
                                />
                              </Entrance>
                            ))}
                          </Box>
                        </>
                      ) : (
                        <EmptyState
                          testID={`boletim-term-${vm.selectedTerm}-not-evaluated`}
                          icon={ClockIcon}
                          title={strings.boletim.notEvaluatedTitle}
                          description={vm.notEvaluatedDescription}
                        />
                      )}
                    </Box>
                  </Box>
                ) : null}
              </Box>
            </>
          ) : null}
        </Box>
      </TabScreenLayout>
    </Screen>
  );
}

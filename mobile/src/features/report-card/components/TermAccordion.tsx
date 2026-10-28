import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';

import { Accordion } from '../../../components/Accordion';
import { Box, Card, Text, useTheme } from '../../../theme';
import type { ReportCardTerm } from '../useReportCardViewModel';
import { SubjectAccordion } from './SubjectAccordion';

type TermAccordionProps = {
  term: ReportCardTerm;
  onToggle: () => void;
  onToggleSubject: (index: number) => void;
  /** Cabeçalho; as disciplinas são `${testID}-subject-<i>`. */
  testID: string;
};

/**
 * Trimestre do Boletim (01-design.md, 2.11): card de 90 com "1º TRIMESTRE"
 * e chevron; aberto, as disciplinas em acordeão, a 28 da borda (`xl`). Na
 * 1ª abertura as disciplinas entram em fade escalonado (4.6).
 */
export function TermAccordion({
  term,
  onToggle,
  onToggleSubject,
  testID,
}: TermAccordionProps) {
  const { motion, sizes } = useTheme();

  return (
    <Accordion
      testID={testID}
      accessibilityLabel={term.accessibilityLabel}
      expanded={term.expanded}
      onToggle={onToggle}
      renderHeader={chevron => (
        <Box marginHorizontal="m">
          <Card variant="term">
            <Text
              variant="termTitle"
              maxFontSizeMultiplier={sizes.fixedHeightFontScale}
            >
              {term.title}
            </Text>
            {chevron}
          </Card>
        </Box>
      )}
    >
      <Box paddingHorizontal="xl" paddingTop="xs" paddingBottom="s">
        {term.subjects.map(subject => (
          <Animated.View
            key={subject.key}
            entering={FadeIn.duration(motion.fast)
              .delay(
                Math.min(subject.index, motion.maxStaggered) *
                  motion.subjectStagger,
              )
              .reduceMotion(ReduceMotion.System)}
          >
            <SubjectAccordion
              testID={`${testID}-subject-${subject.index}`}
              subject={subject}
              onToggle={() => onToggleSubject(subject.index)}
            />
          </Animated.View>
        ))}
      </Box>
    </Accordion>
  );
}

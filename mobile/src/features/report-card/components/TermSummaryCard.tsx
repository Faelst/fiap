import { Box, Card, Text } from '../../../theme';
import type { ReportCardTermSummary } from '../useReportCardViewModel';
import { GradeBar } from './GradeBar';
import { GradeChip } from './GradeChip';

type TermSummaryCardProps = {
  summary: ReportCardTermSummary;
  /** Atraso do preenchimento da barra (depois da entrada do card). */
  barDelay: number;
  /** Filhos: `X-average`, `X-absences`, `X-band`, `X-bar`. */
  testID: string;
};

function Stat({
  value,
  label,
  testID,
}: {
  value: number;
  label: string;
  testID?: string;
}) {
  return (
    <Box flex={1}>
      <Text testID={testID} variant="stat">
        {value}
      </Text>
      <Text variant="caption">{label}</Text>
    </Box>
  );
}

/**
 * Resumo do trimestre (01-design.md da v2, 2.13): média com o selo e a
 * barra da faixa, e faltas, disciplinas e notas abaixo de 7. Um elemento
 * só para o leitor de tela, com o rótulo completo.
 */
export function TermSummaryCard({
  summary,
  barDelay,
  testID,
}: TermSummaryCardProps) {
  return (
    <Card
      testID={testID}
      variant="surface"
      accessible
      accessibilityRole="text"
      accessibilityLabel={summary.accessibilityLabel}
    >
      <Box flexDirection="row" alignItems="center" gap="s">
        <Text variant="overline" flex={1} numberOfLines={1}>
          {summary.title}
        </Text>
        <GradeChip band={summary.band} testID={`${testID}-band`} />
      </Box>
      <Text testID={`${testID}-average`} variant="display" marginTop="s">
        {summary.averageText}
      </Text>
      <Text variant="caption">{summary.averageCaption}</Text>
      <Box marginTop="sm">
        <GradeBar
          testID={`${testID}-bar`}
          grade={summary.average}
          band={summary.band}
          size="summary"
          delay={barDelay}
        />
      </Box>
      <Box height={1} backgroundColor="borderSubtle" marginVertical="m" />
      <Box flexDirection="row" gap="s">
        <Stat
          testID={`${testID}-absences`}
          value={summary.absences}
          label={summary.absencesLabel}
        />
        <Stat value={summary.subjects} label={summary.subjectsLabel} />
        <Stat value={summary.belowTarget} label={summary.belowTargetLabel} />
      </Box>
    </Card>
  );
}

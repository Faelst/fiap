import { Box, Card, Text } from '../../../theme';
import type { ReportCardSubject } from '../useReportCardViewModel';
import { bandColors } from './bandColors';
import { GradeBar } from './GradeBar';
import { GradeChip } from './GradeChip';

type SubjectGradeCardProps = {
  subject: ReportCardSubject;
  /** Atraso do preenchimento da barra (depois da entrada do card). */
  barDelay: number;
  /** Filhos: `X-grade`, `X-band`, `X-absences`. */
  testID: string;
};

/**
 * Card de disciplina (01-design.md da v2, 2.14): nome, nota grande na cor
 * da faixa, a barra de 0 a 10, o selo da faixa e as faltas. Não abre nada:
 * é um elemento de texto só, com o rótulo completo para o leitor de tela.
 */
export function SubjectGradeCard({
  subject,
  barDelay,
  testID,
}: SubjectGradeCardProps) {
  const missing = subject.grade === null;

  return (
    <Card
      testID={testID}
      variant="surfaceCompact"
      accessible
      accessibilityRole="text"
      accessibilityLabel={subject.accessibilityLabel}
    >
      <Box flexDirection="row" alignItems="center" gap="sm">
        <Text variant="subtitle" flex={1} numberOfLines={2}>
          {subject.name}
        </Text>
        <Text
          testID={`${testID}-grade`}
          variant="grade"
          color={missing ? 'textTertiary' : bandColors[subject.band].color}
        >
          {subject.gradeText}
        </Text>
      </Box>
      <Box marginTop="s">
        <GradeBar
          grade={subject.grade}
          band={subject.band}
          size="card"
          delay={barDelay}
        />
      </Box>
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        gap="s"
        marginTop="s"
      >
        <GradeChip band={subject.band} testID={`${testID}-band`} />
        <Text testID={`${testID}-absences`} variant="caption">
          {subject.absencesText}
        </Text>
      </Box>
    </Card>
  );
}

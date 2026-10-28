import { Accordion } from '../../../components/Accordion';
import { strings } from '../../../constants/strings';
import { Box, Text } from '../../../theme';
import type { ReportCardSubject } from '../useReportCardViewModel';

type SubjectAccordionProps = {
  subject: ReportCardSubject;
  onToggle: () => void;
  /** Cabeçalho; `-grade`, `-absences` e `-result` saem dele. */
  testID: string;
};

/**
 * Disciplina do Boletim (01-design.md, 2.11): nome em maiúsculas e chevron;
 * aberta, "Nota:" e "Faltas:" com o valor ou `-`, num elemento só para o
 * leitor de tela ("Nota 9,5, 0 faltas"). Nota e Faltas fazem fade junto com a
 * altura.
 */
export function SubjectAccordion({
  subject,
  onToggle,
  testID,
}: SubjectAccordionProps) {
  return (
    <Accordion
      testID={testID}
      accessibilityLabel={subject.name}
      expanded={subject.expanded}
      onToggle={onToggle}
      fadeContent
      renderHeader={chevron => (
        <Box flexDirection="row" alignItems="center" gap="m">
          <Box flex={1}>
            <Text variant="subject" numberOfLines={2}>
              {subject.name}
            </Text>
          </Box>
          {chevron}
        </Box>
      )}
    >
      <Box
        testID={`${testID}-result`}
        accessible
        accessibilityLabel={subject.resultAccessibilityLabel}
        gap="xs"
        paddingBottom="s"
      >
        <Box flexDirection="row" gap="sm">
          <Text variant="detail">{strings.boletim.grade}</Text>
          <Text testID={`${testID}-grade`} variant="detail">
            {subject.grade}
          </Text>
        </Box>
        <Box flexDirection="row" gap="sm">
          <Text variant="detail">{strings.boletim.absences}</Text>
          <Text testID={`${testID}-absences`} variant="detail">
            {subject.absences}
          </Text>
        </Box>
      </Box>
    </Accordion>
  );
}

import { Text } from '../theme';

type SectionTitleProps = {
  title: string;
  /** Em caixa normal, para o leitor não soletrar ("Agenda"). */
  accessibilityLabel: string;
  testID: string;
};

/** Título da seção (AGENDA, BOLETIM), 01-design.md 2.3. */
export function SectionTitle({
  title,
  accessibilityLabel,
  testID,
}: SectionTitleProps) {
  return (
    <Text
      testID={testID}
      variant="sectionTitle"
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel}
    >
      {title}
    </Text>
  );
}

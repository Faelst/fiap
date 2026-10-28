import { strings } from '../../../constants/strings';
import { Box, Text, useTheme } from '../../../theme';
import { bandColors } from './bandColors';

const BANDS = ['good', 'warning', 'low'] as const;

/**
 * Legenda das faixas embaixo do resumo (2.13): pontos de 8 nas 3 cores e o
 * corte de cada uma. Um elemento só para o leitor de tela.
 */
export function GradeLegend({ testID }: { testID: string }) {
  const { sizes } = useTheme();
  const { legend } = strings.boletim;

  return (
    <Box
      testID={testID}
      accessible
      accessibilityRole="text"
      accessibilityLabel={legend.accessibilityLabel}
      flexDirection="row"
      flexWrap="wrap"
      columnGap="m"
      rowGap="xs"
      marginTop="sm"
      paddingHorizontal="xs"
    >
      {BANDS.map(band => (
        <Box key={band} flexDirection="row" alignItems="center" gap="xs">
          <Box
            width={sizes.reportCard.legendDot}
            height={sizes.reportCard.legendDot}
            borderRadius="pill"
            backgroundColor={bandColors[band].color}
          />
          <Text variant="caption">{legend[band]}</Text>
        </Box>
      ))}
    </Box>
  );
}

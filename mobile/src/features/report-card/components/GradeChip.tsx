import { strings } from '../../../constants/strings';
import { Box, Text, useTheme } from '../../../theme';
import type { GradeBand } from '../../../utils/grades';
import { bandColors } from './bandColors';

type GradeChipProps = { band: GradeBand; testID?: string };

/**
 * Selo da faixa (2.13): pílula de 24 com ponto e rótulo na cor da faixa,
 * sobre o fundo `*Muted`. O rótulo existe sempre: a cor nunca é a única
 * pista (6.2).
 */
export function GradeChip({ band, testID }: GradeChipProps) {
  const { sizes } = useTheme();
  const { color, muted } = bandColors[band];
  const { chip, chipDot } = sizes.reportCard;

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      alignSelf="flex-start"
      gap="xs"
      height={chip}
      paddingHorizontal="s"
      borderRadius="pill"
      backgroundColor={muted}
    >
      <Box
        width={chipDot}
        height={chipDot}
        borderRadius="pill"
        backgroundColor={color}
      />
      <Text
        testID={testID}
        variant="caption"
        color={color}
        maxFontSizeMultiplier={sizes.fixedHeightFontScale}
      >
        {strings.boletim.band[band]}
      </Text>
    </Box>
  );
}

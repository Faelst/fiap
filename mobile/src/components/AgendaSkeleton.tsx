import { strings } from '../constants/strings';
import { Box, useTheme } from '../theme';
import { Skeleton, SkeletonGroup } from './Skeleton';

const DAYS = 7;

/**
 * Carregamento da Agenda (01-design.md da v2, 2.16): a faixa com 7 chips, o
 * banner e 4 blocos de aula a partir de 1 hora da grade, com um shimmer só.
 * Para o leitor é um só "Carregando agenda…".
 */
export function AgendaSkeleton({ testID }: { testID: string }) {
  const { sizes, textVariants } = useTheme();
  const { weekChip, timetable, skeleton, banner, pill } = sizes;

  return (
    <Box
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={strings.agenda.loadingAccessibilityLabel}
      paddingHorizontal="m"
    >
      <SkeletonGroup>
        <Box
          testID={`${testID}-blocks`}
          importantForAccessibility="no-hide-descendants"
        >
          <Box height={pill.xs} justifyContent="center">
            <Skeleton
              radius="s"
              width="35%"
              height={textVariants.subtitle.lineHeight}
            />
          </Box>
          <Box
            testID={`${testID}-days`}
            flexDirection="row"
            gap="xs"
            marginTop="s"
          >
            {Array.from({ length: DAYS }, (_, day) => (
              <Skeleton
                key={day}
                radius="l"
                flex={1}
                height={weekChip.height}
              />
            ))}
          </Box>
          <Skeleton radius="m" height={banner} marginTop="m" />
          <Box marginTop="m" style={{ paddingLeft: timetable.gutter }} gap="xs">
            {skeleton.blockHeights.map((height, row) => (
              <Skeleton
                key={row}
                testID={`${testID}-row-${row}`}
                radius="s"
                height={height}
              />
            ))}
          </Box>
        </Box>
      </SkeletonGroup>
    </Box>
  );
}

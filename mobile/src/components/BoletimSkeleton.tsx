import { strings } from '../constants/strings';
import { Box, useTheme } from '../theme';
import { Skeleton, SkeletonGroup } from './Skeleton';

type BoletimSkeletonProps = {
  testID: string;
  /** `false` na troca de ano: o segmento de ano real continua na tela. */
  withYear?: boolean;
};

const SUBJECTS = [0, 1, 2, 3];

/**
 * Carregamento do Boletim (01-design.md da v2, 2.16): o segmento de ano
 * (60 %), o de trimestre, o card de resumo e 4 cards de disciplina, com o
 * shimmer. Para o leitor é um só "Carregando boletim…".
 */
export function BoletimSkeleton({
  testID,
  withYear = true,
}: BoletimSkeletonProps) {
  const { sizes } = useTheme();
  const { skeletonSummary, skeletonSubject, skeletonYearWidth } =
    sizes.reportCard;

  return (
    <Box
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={strings.boletim.loadingAccessibilityLabel}
    >
      <SkeletonGroup>
        <Box
          testID={`${testID}-blocks`}
          importantForAccessibility="no-hide-descendants"
          marginHorizontal="m"
          gap="s"
        >
          {withYear ? (
            <Skeleton
              testID={`${testID}-year`}
              radius="pill"
              width={skeletonYearWidth}
              height={sizes.segmented.sm}
              marginBottom="xs"
            />
          ) : null}
          <Skeleton
            testID={`${testID}-term`}
            radius="pill"
            height={sizes.segmented.md}
            marginBottom="s"
          />
          <Skeleton
            testID={`${testID}-summary`}
            radius="l"
            height={skeletonSummary}
            marginBottom="m"
          />
          {SUBJECTS.map(index => (
            <Skeleton
              key={index}
              testID={`${testID}-subject-${index}`}
              radius="m"
              height={skeletonSubject}
            />
          ))}
        </Box>
      </SkeletonGroup>
    </Box>
  );
}

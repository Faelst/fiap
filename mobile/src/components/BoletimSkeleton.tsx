import Animated, { FadeOut, ReduceMotion } from 'react-native-reanimated';

import { strings } from '../constants/strings';
import { useSkeletonPulse } from '../hooks/useSkeletonPulse';
import { Box, useTheme } from '../theme';
import { Skeleton } from './Skeleton';

type BoletimSkeletonProps = {
  testID: string;
  /** `false` na troca de ano: o dropdown real continua na tela. */
  withDropdown?: boolean;
};

const TERMS = [1, 2, 3];

/**
 * Carregamento do Boletim (01-design.md, 2.13): o dropdown e os 3 cards de
 * trimestre. Para o leitor é um só "Carregando boletim".
 */
export function BoletimSkeleton({
  testID,
  withDropdown = true,
}: BoletimSkeletonProps) {
  const { motion, sizes } = useTheme();
  const pulse = useSkeletonPulse();

  return (
    <Animated.View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={strings.boletim.loadingAccessibilityLabel}
      exiting={FadeOut.duration(motion.fast).reduceMotion(ReduceMotion.System)}
    >
      {/* O pulso fica num filho: a saída (layout animation) também mexe na opacidade. */}
      <Animated.View style={pulse}>
        <Box
          testID={`${testID}-blocks`}
          importantForAccessibility="no-hide-descendants"
          marginHorizontal="m"
          gap="m"
        >
          {withDropdown ? (
            <Skeleton testID={`${testID}-dropdown`} height={sizes.dropdown} />
          ) : null}
          {TERMS.map(term => (
            <Skeleton
              key={term}
              testID={`${testID}-term-${term}`}
              height={sizes.termCard}
            />
          ))}
        </Box>
      </Animated.View>
    </Animated.View>
  );
}

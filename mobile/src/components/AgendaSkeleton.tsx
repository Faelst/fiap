import Animated, { FadeOut, ReduceMotion } from 'react-native-reanimated';

import { strings } from '../constants/strings';
import { useSkeletonPulse } from '../hooks/useSkeletonPulse';
import { Box, useTheme } from '../theme';
import { Skeleton } from './Skeleton';

/**
 * Carregamento da Agenda (01-design.md, 2.13): o dropdown e 4 aulas no
 * formato do `LessonItem`. Para o leitor é um só "Carregando agenda".
 */
export function AgendaSkeleton({ testID }: { testID: string }) {
  const { motion, sizes, textVariants } = useTheme();
  const pulse = useSkeletonPulse();
  const rows = Array.from({ length: sizes.skeletonLessonRows }, (_, i) => i);

  return (
    <Animated.View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={strings.agenda.loadingAccessibilityLabel}
      exiting={FadeOut.duration(motion.fast).reduceMotion(ReduceMotion.System)}
    >
      {/* O pulso fica num filho: a saída (layout animation) também mexe na opacidade. */}
      <Animated.View style={pulse}>
        <Box
          testID={`${testID}-blocks`}
          importantForAccessibility="no-hide-descendants"
        >
          <Skeleton
            testID={`${testID}-dropdown`}
            marginHorizontal="l"
            height={sizes.dropdown}
          />
          <Box paddingHorizontal="xxxl" marginTop="l" gap="m">
            {rows.map(row => (
              <Box
                key={row}
                testID={`${testID}-row-${row}`}
                flexDirection="row"
              >
                <Box
                  width={sizes.bulletSlot}
                  height={textVariants.captionPlain.lineHeight}
                  justifyContent="center"
                >
                  <Skeleton
                    radius="round"
                    width={sizes.bullet}
                    height={sizes.bullet}
                  />
                </Box>
                <Box gap="s">
                  <Skeleton style={sizes.skeletonLessonTime} />
                  <Skeleton style={sizes.skeletonLessonSubject} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Animated.View>
    </Animated.View>
  );
}

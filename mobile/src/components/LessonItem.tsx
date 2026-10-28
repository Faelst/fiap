import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';

import { strings } from '../constants/strings';
import { Box, Text, useTheme } from '../theme';

type LessonItemProps = {
  startTime: string;
  endTime: string;
  subject: string;
  /** Posição na lista: escalona a entrada (até `motion.maxStaggered`). */
  index: number;
  /** Atraso antes do escalonamento (a 1ª entrada da tela espera o header, 4.3). */
  enterDelay?: number;
  testID: string;
};

/**
 * Aula da Agenda (01-design.md, 2.9): bolinha vazada, horário e disciplina.
 * Para o leitor de tela é um elemento só ("Das 07:15 às 08:00, Matemática I").
 */
export function LessonItem({
  startTime,
  endTime,
  subject,
  index,
  enterDelay = 0,
  testID,
}: LessonItemProps) {
  const { motion, sizes, textVariants } = useTheme();
  const step = Math.min(index, motion.maxStaggered - 1);

  return (
    <Animated.View
      entering={FadeInDown.duration(motion.base)
        .delay(enterDelay + step * motion.stagger)
        .easing(motion.easeOut)
        .withInitialValues({
          transform: [{ translateY: motion.enterOffsetSmall }],
        })
        .reduceMotion(ReduceMotion.System)}
    >
      <Box
        testID={testID}
        flexDirection="row"
        accessible
        accessibilityLabel={strings.agenda.lessonAccessibilityLabel(
          startTime,
          endTime,
          subject,
        )}
      >
        <Box
          testID={`${testID}-bullet-slot`}
          width={sizes.bulletSlot}
          height={textVariants.captionPlain.lineHeight}
          justifyContent="center"
        >
          <Box
            testID={`${testID}-bullet`}
            width={sizes.bullet}
            height={sizes.bullet}
            borderRadius="round"
            borderWidth={1}
            borderColor="bulletBorder"
          />
        </Box>
        <Box flex={1} gap="s">
          <Text testID={`${testID}-time`} variant="captionPlain">
            {strings.agenda.lessonTime(startTime, endTime)}
          </Text>
          <Text
            testID={`${testID}-subject`}
            variant="lessonSubject"
            numberOfLines={2}
          >
            {subject}
          </Text>
        </Box>
      </Box>
    </Animated.View>
  );
}

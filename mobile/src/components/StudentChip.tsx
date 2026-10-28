import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { strings } from '../constants/strings';
import { Box, Text, useTheme } from '../theme';
import { Avatar } from './Avatar';
import { Entrance } from './Entrance';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

export type ChipStudent = {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  rm: number;
  period: string;
};

type StudentChipProps = {
  student: ChipStudent;
  onPress: () => void;
};

/** Folga do toque: o chip tem 40 de altura, a área chega a 44 (6.3). */
const HIT_SLOP = 2;

/**
 * Chip do aluno no header (01-design.md da v2, 2.6): avatar de iniciais,
 * `Rafael · 7EF` e um chevron. Leva ao Perfil. Para o leitor de tela é um
 * botão só, com o rótulo do aluno da v1. Trocar de aluno faz crossfade do
 * conteúdo (`key` pelo id); o 1º aluno entra junto com o header.
 */
export function StudentChip({ student, onPress }: StudentChipProps) {
  const { colors, motion, sizes } = useTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const [firstStudentId] = useState(student.id);
  const [switched, setSwitched] = useState(false);
  if (!switched && student.id !== firstStudentId) setSwitched(true);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));
  const pressIn = () => {
    if (!reducedMotion) {
      scale.set(withSpring(motion.pressScaleSmall, motion.press));
    }
  };
  const pressOut = () => {
    if (!reducedMotion) scale.set(withSpring(1, motion.press));
  };

  return (
    <Pressable
      testID="header-student-chip"
      accessibilityRole="button"
      accessibilityLabel={strings.header.studentAccessibilityLabel(
        student.firstName,
        student.className,
        student.rm,
        student.period,
      )}
      accessibilityHint={strings.header.studentHint}
      hitSlop={HIT_SLOP}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
    >
      <Animated.View style={scaleStyle}>
        <Box
          testID="header-student-chip-surface"
          height={sizes.studentChip.height}
          maxWidth={sizes.studentChip.maxWidth}
          flexDirection="row"
          alignItems="center"
          gap="s"
          paddingLeft="xs"
          paddingRight="s"
          borderRadius="pill"
          borderWidth={1}
          borderColor="borderSubtle"
          backgroundColor="surfaceRaised"
        >
          {/* Troca de aluno: o conteúdo novo entra em fade por valor animado
              (sem layout animation, risco no Android); o antigo sai sem animação. */}
          <Entrance
            key={student.id}
            testID="header-student-chip-content"
            enabled={switched}
            duration={motion.base}
            style={styles.shrink}
          >
            <Box flexDirection="row" alignItems="center" gap="s">
              <Avatar
                testID="header-student-chip-avatar"
                firstName={student.firstName}
                lastName={student.lastName}
                size="s"
                tone="student"
              />
              <Box flexDirection="row" alignItems="center" flexShrink={1}>
                <Text
                  testID="header-student-name"
                  variant="bodyStrong"
                  numberOfLines={1}
                  flexShrink={1}
                  maxFontSizeMultiplier={sizes.fixedHeightFontScale}
                >
                  {student.firstName}
                </Text>
                <Text
                  variant="bodyStrong"
                  color="textSecondary"
                  maxFontSizeMultiplier={sizes.fixedHeightFontScale}
                >
                  {strings.header.studentChipSeparator}
                </Text>
                <Text
                  testID="header-student-class"
                  variant="bodyStrong"
                  color="textSecondary"
                  maxFontSizeMultiplier={sizes.fixedHeightFontScale}
                >
                  {student.className}
                </Text>
              </Box>
            </Box>
          </Entrance>
          <ChevronRightIcon
            color={colors.textTertiary}
            size={sizes.studentChip.chevron}
          />
        </Box>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
});

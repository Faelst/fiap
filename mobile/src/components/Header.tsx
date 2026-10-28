import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  ReduceMotion,
} from 'react-native-reanimated';

import { strings } from '../constants/strings';
import { Box, Text, useTheme } from '../theme';
import { ActionBar } from './ActionBar';

export type HeaderStudent = {
  id: string;
  firstName: string;
  rm: number;
  className: string;
  period: string;
};

type HeaderProps = {
  guardianFirstName: string;
  /** Sem aluno (tela "sem aluno"): só a saudação. */
  student?: HeaderStudent | null;
  canSwitchStudent: boolean;
  onSwitchStudent: () => void;
  onLogout: () => void;
  logoutDisabled?: boolean;
  /** Conteúdo da tela, que rola junto com a saudação. */
  children?: ReactNode;
};

/**
 * Header das telas autenticadas (R5, 01-design.md 2.2): a barra de ações
 * fica fixa; saudação, bloco do aluno e o conteúdo da tela rolam juntos.
 * Entrada (4.3) só na montagem; trocar de aluno faz crossfade do bloco do
 * aluno (`key` pelo id).
 */
export function Header({
  guardianFirstName,
  student,
  canSwitchStudent,
  onSwitchStudent,
  onLogout,
  logoutDisabled,
  children,
}: HeaderProps) {
  const { motion, spacing } = useTheme();
  const studentId = student?.id ?? null;
  // O 1º aluno entra com a entrada da tela; os seguintes, com crossfade.
  const [firstStudentId] = useState(studentId);
  const [switched, setSwitched] = useState(false);
  if (!switched && studentId !== firstStudentId) setSwitched(true);

  const enterDown = (delay: number) =>
    FadeInDown.duration(motion.base)
      .delay(delay)
      .easing(motion.easeOut)
      .withInitialValues({
        transform: [{ translateY: motion.enterOffsetSmall }],
      })
      .reduceMotion(ReduceMotion.System);

  return (
    <Box testID="header" flex={1}>
      <ActionBar
        canSwitchStudent={canSwitchStudent}
        onSwitchStudent={onSwitchStudent}
        onLogout={onLogout}
        logoutDisabled={logoutDisabled}
      />
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.grow}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={enterDown(0)} style={{ marginTop: spacing.m }}>
          <Text
            testID="header-greeting"
            variant="greeting"
            accessibilityRole="header"
            accessibilityLabel={strings.header.greetingAccessibilityLabel(
              guardianFirstName,
            )}
          >
            {strings.header.greeting}
            <Text variant="greetingName">{guardianFirstName}</Text>
          </Text>
        </Animated.View>
        {student ? (
          <Animated.View
            key={student.id}
            entering={
              switched
                ? FadeIn.duration(motion.base).reduceMotion(ReduceMotion.System)
                : enterDown(motion.stagger)
            }
            exiting={FadeOut.duration(motion.fast).reduceMotion(
              ReduceMotion.System,
            )}
          >
            <Box
              alignItems="center"
              gap="s"
              accessible
              accessibilityLabel={strings.header.studentAccessibilityLabel(
                student.firstName,
                student.className,
                student.rm,
                student.period,
              )}
              style={{ marginTop: spacing.xxl }}
            >
              <Text
                testID="header-student-name"
                variant="body"
                textTransform="uppercase"
              >
                {student.firstName}
              </Text>
              <Text testID="header-student-info" variant="body">
                {strings.common.studentInfo(
                  student.className,
                  student.rm,
                  student.period,
                )}
              </Text>
            </Box>
          </Animated.View>
        ) : null}
        {children}
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  grow: { flexGrow: 1 },
});

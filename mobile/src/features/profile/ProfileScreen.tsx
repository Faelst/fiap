import { useIsFocused } from '@react-navigation/native';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ReduceMotion,
  useReducedMotion,
} from 'react-native-reanimated';

import { Avatar } from '../../components/Avatar';
import { Screen } from '../../components/Screen';
import { strings } from '../../constants/strings';
import { useFloatingTabBarInset } from '../../hooks/useFloatingTabBarInset';
import { Box, Card, Text, useTheme, type Theme } from '../../theme';
import { LogoutRow } from './components/LogoutRow';
import { StudentRow } from './components/StudentRow';
import { useProfileViewModel } from './useProfileViewModel';

type Motion = Theme['motion'];

/**
 * Entrada em cascata da 1ª visita (4.6): o card do responsável, as linhas
 * de aluno e a "Conta", de 12 para cima, até o teto do stagger. Com reduzir
 * movimento, só o fade (opacidade não é movimento).
 */
function entering(motion: Motion, reduced: boolean, index: number) {
  if (reduced) {
    return FadeIn.duration(motion.fast).reduceMotion(ReduceMotion.Never);
  }
  return FadeInDown.duration(motion.base)
    .delay(Math.min(index, motion.maxStaggered - 1) * motion.cardStagger)
    .easing(motion.easeOut)
    .withInitialValues({ transform: [{ translateY: motion.enterOffset }] })
    .reduceMotion(ReduceMotion.System);
}

/**
 * Aba Perfil (V3, 01-design.md da v2 3.5): o responsável (nome e CPF
 * mascarado, como a API manda), os alunos com o atual em destaque e a troca
 * num toque (DV8), e "Sair da conta" com confirmação inline (DV7). O
 * conteúdo rola por baixo da tab bar flutuante.
 */
export function ProfileScreen() {
  const vm = useProfileViewModel({ focused: useIsFocused() });
  const { colors, motion, sizes, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const insetBottom = useFloatingTabBarInset();
  const enter = (index: number) => entering(motion, reducedMotion, index);
  const accountIndex = 1 + vm.students.length;

  return (
    <Screen testID="profile-screen">
      <ScrollView
        testID="profile-scroll"
        style={styles.fill}
        contentContainerStyle={{
          paddingHorizontal: spacing.m,
          paddingBottom: insetBottom,
        }}
        scrollIndicatorInsets={{ bottom: insetBottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surfaceRaised}
          />
        }
      >
        <Text
          testID="profile-title"
          variant="headline"
          accessibilityRole="header"
          marginTop="m"
        >
          {strings.profile.title}
        </Text>

        {vm.guardian ? (
          <Animated.View entering={enter(0)} style={{ marginTop: spacing.sm }}>
            <Card
              testID="profile-guardian-card"
              variant="surface"
              accessible
              accessibilityLabel={strings.profile.guardianAccessibilityLabel(
                vm.guardian.fullName,
                vm.guardian.cpfMasked,
              )}
            >
              <Box flexDirection="row" alignItems="center" gap="m">
                <Avatar
                  firstName={vm.guardian.firstName}
                  lastName={vm.guardian.lastName}
                  size="l"
                  tone="guardian"
                />
                <Box flex={1} gap="xxs">
                  <Text testID="profile-guardian-name" variant="title">
                    {vm.guardian.fullName}
                  </Text>
                  <Text variant="caption">{strings.profile.guardianRole}</Text>
                </Box>
              </Box>
              <Box
                height={StyleSheet.hairlineWidth}
                backgroundColor="borderSubtle"
                marginVertical="m"
              />
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                gap="m"
              >
                <Text variant="label">{strings.profile.cpfLabel}</Text>
                <Text
                  testID="profile-guardian-cpf"
                  variant="body"
                  style={styles.tabular}
                >
                  {vm.guardian.cpfMasked}
                </Text>
              </Box>
            </Card>
          </Animated.View>
        ) : null}

        <Box marginTop="l">
          <Text variant="overline" accessibilityRole="header">
            {strings.profile.studentsHeader}
          </Text>
          {vm.canSwitch ? (
            <Text
              testID="profile-students-hint"
              variant="caption"
              marginTop="xxs"
            >
              {strings.profile.studentsHint}
            </Text>
          ) : null}
        </Box>
        <Box gap="s" marginTop="sm">
          {vm.students.map((student, index) => (
            <Animated.View key={student.id} entering={enter(1 + index)}>
              <StudentRow
                testID={`profile-student-${student.rm}`}
                firstName={student.firstName}
                lastName={student.lastName}
                fullName={student.fullName}
                rm={student.rm}
                className={student.className}
                period={student.period}
                selected={student.selected}
                pressable={vm.canSwitch}
                onPress={() => vm.onSelectStudent(student.id)}
              />
            </Animated.View>
          ))}
        </Box>

        <Animated.View
          entering={enter(accountIndex)}
          style={{ marginTop: spacing.l }}
        >
          <Text variant="overline" accessibilityRole="header">
            {strings.profile.accountHeader}
          </Text>
          <Box marginTop="sm" minHeight={sizes.profile.logoutRow}>
            <LogoutRow
              testID="profile-logout"
              confirming={vm.confirmingLogout}
              loggingOut={vm.loggingOut}
              onAsk={vm.onAskLogout}
              onCancel={vm.onCancelLogout}
              onConfirm={vm.onConfirmLogout}
            />
          </Box>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  tabular: { fontVariant: ['tabular-nums'] },
});

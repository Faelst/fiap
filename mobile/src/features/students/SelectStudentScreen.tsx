import { useEffect, useRef, type ComponentRef } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  ScrollView,
  StyleSheet,
  type Text as RNText,
} from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseIcon } from '../../components/icons/CloseIcon';
import { Screen } from '../../components/Screen';
import { StudentCard } from '../../components/StudentCard';
import { strings } from '../../constants/strings';
import type { RootStackScreenProps } from '../../navigation/types';
import { Box, enterDown, Text, useTheme } from '../../theme';
import { useSelectStudentViewModel } from './useSelectStudentViewModel';

/** Teto do stagger (01-design.md, 1.8): do 7º card em diante, sem atraso. */
const MAX_STAGGERED = 6;

/**
 * Seleção de aluno (R9, M6, 01-design.md 3.5): modal de tela cheia, fora do
 * rodapé. FECHAR no topo direito; título e cards num bloco centralizado na
 * vertical, que rola quando há muitos alunos.
 */
export function SelectStudentScreen({
  navigation,
}: RootStackScreenProps<'SelectStudent'>) {
  const { colors, motion, sizes, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const vm = useSelectStudentViewModel(navigation);
  const titleRef = useRef<ComponentRef<typeof RNText>>(null);

  // O leitor de tela começa no título (6.4), e não no FECHAR, que fica acima
  // dele. Só depois que o modal terminou de subir: antes disso o foco cai na
  // tela de baixo.
  useEffect(
    () =>
      navigation.addListener('transitionEnd', ({ data }) => {
        if (data.closing || !titleRef.current) return;
        AccessibilityInfo.sendAccessibilityEvent(titleRef.current, 'focus');
      }),
    [navigation],
  );
  return (
    <Screen testID="select-student-screen">
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[
          styles.center,
          { paddingHorizontal: spacing.m, paddingVertical: spacing.section },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={enterDown(motion, 0)}>
          <Text ref={titleRef} variant="titleV1" accessibilityRole="header">
            {strings.selectStudent.title}
          </Text>
        </Animated.View>
        <Box gap="m" style={{ marginTop: spacing.section }}>
          {vm.students.map((student, index) => (
            <Animated.View
              key={student.id}
              entering={enterDown(
                motion,
                motion.stagger +
                  Math.min(index, MAX_STAGGERED - 1) * motion.cardStagger,
              )}
            >
              <StudentCard
                testID={`select-student-card-${student.rm}`}
                fullName={student.fullName}
                rm={student.rm}
                className={student.className}
                period={student.period}
                selected={student.selected}
                onPress={() => vm.onSelect(student.id)}
              />
            </Animated.View>
          ))}
        </Box>
      </ScrollView>
      <Animated.View
        testID="select-student-close"
        // A Screen aplica a área segura no conteúdo, não no que é absoluto.
        style={[
          styles.close,
          { top: insets.top + spacing.m, right: spacing.m },
        ]}
        entering={FadeIn.duration(motion.base)
          .delay(motion.stagger)
          .reduceMotion(ReduceMotion.System)}
      >
        <Pressable
          testID="select-student-close-button"
          accessibilityRole="button"
          accessibilityLabel={strings.selectStudent.closeAccessibilityLabel}
          onPress={vm.onClose}
          hitSlop={spacing.s}
        >
          <Box
            flexDirection="row"
            alignItems="center"
            gap="s"
            minHeight={sizes.touchTarget}
          >
            <Text
              variant="bodyBold"
              color="primary"
              maxFontSizeMultiplier={sizes.fixedHeightFontScale}
            >
              {strings.selectStudent.close}
            </Text>
            <CloseIcon color={colors.primary} size={sizes.icon} />
          </Box>
        </Pressable>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flexGrow: 1, justifyContent: 'center' },
  close: { position: 'absolute' },
});

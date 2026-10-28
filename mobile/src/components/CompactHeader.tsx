import { Image, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';

import { strings } from '../constants/strings';
import { Box, enterDown, Text, useTheme, type Theme } from '../theme';
import { StudentChip, type ChipStudent } from './StudentChip';

const logo = require('../../assets/logo-fiap-school.png');

type CompactHeaderProps = {
  title: string;
  /** testID do título: `agenda-title`, `boletim-title`, `profile-title`... */
  titleTestID: string;
  /** Sem responsável (BootError: o `/me` falhou), sem saudação. */
  guardianFirstName?: string;
  student?: ChipStudent | null;
  onPressStudent?: () => void;
  /** Rolagem do conteúdo embaixo: acende a divisória de baixo. */
  scrollY?: SharedValue<number>;
  /** No Perfil o chip não aparece: a lista de alunos já está na tela. */
  showChip?: boolean;
};

type Motion = Theme['motion'];

/**
 * Entrada do header (4.3): a linha do logo em fade e, um `stagger` depois,
 * saudação e título descendo. Com reduzir movimento, só o fade curto, sem
 * atraso (opacidade não é movimento).
 */
function entrances(motion: Motion, reduced: boolean) {
  if (reduced) {
    const fade = FadeIn.duration(motion.fast).reduceMotion(ReduceMotion.Never);
    return { bar: fade, titles: fade };
  }
  return {
    bar: FadeIn.duration(motion.base).reduceMotion(ReduceMotion.System),
    titles: enterDown(motion, motion.stagger),
  };
}

/**
 * Header compacto das abas e dos estados de início (01-design.md da v2,
 * 2.6), no lugar do `Header` + `ActionBar` da v1: a linha do logo com o
 * chip do aluno (que leva ao Perfil), a saudação e o título da tela. Fica
 * fixo: o conteúdo rola embaixo dele, e a divisória de baixo só aparece
 * quando há conteúdo por baixo.
 */
export function CompactHeader({
  title,
  titleTestID,
  guardianFirstName,
  student,
  onPressStudent,
  scrollY,
  showChip = true,
}: CompactHeaderProps) {
  const { colors, motion, sizes, spacing } = useTheme();
  const enter = entrances(motion, useReducedMotion());
  const fadeDistance = spacing.m;

  const dividerStyle = useAnimatedStyle(() => {
    const y = scrollY ? scrollY.get() : 0;
    return { opacity: Math.min(Math.max(y / fadeDistance, 0), 1) };
  });

  return (
    <Box testID="header">
      <Animated.View testID="header-bar-enter" entering={enter.bar}>
        <Box
          testID="header-bar"
          height={sizes.headerBar}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          gap="m"
          paddingHorizontal="m"
        >
          <Image
            source={logo}
            accessibilityRole="image"
            accessibilityLabel={strings.common.logoLabel}
            style={sizes.logoHeader}
          />
          {showChip && student ? (
            <StudentChip student={student} onPress={() => onPressStudent?.()} />
          ) : null}
        </Box>
      </Animated.View>
      <Animated.View
        testID="header-titles-enter"
        entering={enter.titles}
        style={{ paddingHorizontal: spacing.m, paddingTop: spacing.xs }}
      >
        {guardianFirstName ? (
          <Text
            testID="header-greeting"
            variant="label"
            accessibilityRole="header"
          >
            {strings.header.greeting(guardianFirstName)}
          </Text>
        ) : null}
        <Text
          testID={titleTestID}
          variant="headline"
          accessibilityRole="header"
        >
          {title}
        </Text>
      </Animated.View>
      <Animated.View
        testID="header-divider"
        style={[
          styles.divider,
          { backgroundColor: colors.borderSubtle },
          dividerStyle,
        ]}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  divider: { height: StyleSheet.hairlineWidth },
});

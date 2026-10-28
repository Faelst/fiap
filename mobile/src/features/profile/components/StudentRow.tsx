import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type LayoutAnimation,
} from 'react-native-reanimated';

import { Avatar } from '../../../components/Avatar';
import { CheckIcon } from '../../../components/icons/CheckIcon';
import { strings } from '../../../constants/strings';
import { Box, Text, useTheme, type Theme } from '../../../theme';

type StudentRowProps = {
  /** `profile-student-<rm>`; filhos: `-surface`, `-avatar`, `-highlight`, `-current`, `-radio`. */
  testID: string;
  firstName: string;
  lastName: string;
  fullName: string;
  rm: number;
  className: string;
  period: string;
  /** É o aluno em uso: selo "Atual" e borda teal com brilho. */
  selected: boolean;
  /** Há outro aluno para trocar. Com 1 aluno a linha é só informação. */
  pressable: boolean;
  onPress: () => void;
};

/** Espessura da borda da linha: a camada de destaque cobre a borda. */
const ROW_BORDER = 1;

type Motion = Theme['motion'];

/** Opacidade não é movimento: o fade fica com reduzir movimento (4.6). */
function fadeInFast(motion: Motion) {
  return FadeIn.duration(motion.fast).reduceMotion(ReduceMotion.Never);
}

/**
 * Selo "Atual" entrando quando o aluno acaba de ser escolhido (4.6): fade e
 * escala `popFrom` → 1 com a mola `pop`; com reduzir movimento, só o fade.
 */
function badgeEntering(motion: Motion, reduced: boolean) {
  if (reduced) return fadeInFast(motion);
  const { fast, popFrom, spring } = motion;
  return (): LayoutAnimation => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ scale: popFrom }] },
      animations: {
        opacity: withTiming(1, { duration: fast }),
        transform: [{ scale: withSpring(1, spring.pop) }],
      },
    };
  };
}

/**
 * Linha de um aluno no Perfil (01-design.md da v2, 3.5): avatar, nome e
 * turma · RM · período. O atual tem o selo "Atual" e uma camada de borda
 * teal com brilho; os outros, um rádio vazio. A troca é um crossfade da
 * camada (sem animar cor) e, na linha nova, um "pop" de escala (4.6). Para o
 * leitor de tela é um elemento só, com `selected`.
 */
export function StudentRow({
  testID,
  firstName,
  lastName,
  fullName,
  rm,
  className,
  period,
  selected,
  pressable,
  onPress,
}: StudentRowProps) {
  const { borderRadii, colors, motion, shadows, sizes } = useTheme();
  const reducedMotion = useReducedMotion();
  const highlight = useSharedValue(selected ? 1 : 0);
  const scale = useSharedValue(1);
  const previousSelected = useRef(selected);
  // O selo e o rádio só animam depois de uma troca; na 1ª visita a linha
  // inteira já entra com a tela. Derivado no render, para valer já no render
  // em que o selo monta.
  const [initialSelected] = useState(selected);
  const [toggled, setToggled] = useState(false);
  if (!toggled && selected !== initialSelected) setToggled(true);
  // O atual não troca nada: sem papel de botão, sem toque e sem escala (3.5).
  const switchable = pressable && !selected;

  useEffect(() => {
    if (previousSelected.current === selected) return;
    previousSelected.current = selected;
    highlight.set(
      withTiming(selected ? 1 : 0, {
        duration: selected ? motion.base : motion.fast,
      }),
    );
    if (selected && !reducedMotion) {
      scale.set(
        withSequence(
          withTiming(motion.rowSelectFrom, { duration: 0 }),
          withSpring(1, motion.spring.pop),
        ),
      );
    }
  }, [selected, reducedMotion, highlight, scale, motion]);

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: highlight.get(),
  }));
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const pressIn = () => {
    if (!reducedMotion) scale.set(withSpring(motion.pressScale, motion.press));
  };
  const pressOut = () => {
    if (!reducedMotion) scale.set(withSpring(1, motion.press));
  };

  const fadeOut = FadeOut.duration(motion.fast).reduceMotion(
    ReduceMotion.Never,
  );

  return (
    <Pressable
      testID={testID}
      accessibilityRole={switchable ? 'button' : 'text'}
      accessibilityLabel={strings.profile.studentAccessibilityLabel(
        fullName,
        className,
        rm,
        period,
      )}
      accessibilityHint={switchable ? strings.profile.studentHint : undefined}
      accessibilityState={{ selected }}
      disabled={!switchable}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
    >
      <Animated.View style={scaleStyle}>
        <Box
          testID={`${testID}-surface`}
          flexDirection="row"
          alignItems="center"
          gap="sm"
          minHeight={sizes.profile.studentRow}
          paddingHorizontal="m"
          paddingVertical="sm"
          borderRadius="m"
          borderWidth={ROW_BORDER}
          borderColor="borderSubtle"
          backgroundColor="surfaceRaised"
        >
          <Animated.View
            testID={`${testID}-highlight`}
            pointerEvents="none"
            style={[
              styles.highlight,
              {
                borderRadius: borderRadii.m,
                borderColor: colors.primary,
                boxShadow: [shadows.glowPrimary],
              },
              highlightStyle,
            ]}
          />
          <Avatar
            testID={`${testID}-avatar`}
            firstName={firstName}
            lastName={lastName}
            size="m"
            tone="student"
          />
          <Box flex={1} gap="xxs">
            <Text variant="subtitle" numberOfLines={1}>
              {fullName}
            </Text>
            <Text variant="caption">
              {strings.profile.studentInfo(className, rm, period)}
            </Text>
          </Box>
          {selected ? (
            <Animated.View
              entering={
                toggled ? badgeEntering(motion, reducedMotion) : undefined
              }
              exiting={fadeOut}
            >
              <Box
                testID={`${testID}-current`}
                flexDirection="row"
                alignItems="center"
                gap="xs"
                height={sizes.profile.currentBadge}
                paddingHorizontal="s"
                borderRadius="pill"
                backgroundColor="primaryMuted"
              >
                <CheckIcon
                  color={colors.primary}
                  size={sizes.profile.currentBadgeIcon}
                />
                <Text
                  variant="label"
                  color="primary"
                  maxFontSizeMultiplier={sizes.fixedHeightFontScale}
                >
                  {strings.profile.current}
                </Text>
              </Box>
            </Animated.View>
          ) : null}
          {!selected && pressable ? (
            <Animated.View
              entering={toggled ? fadeInFast(motion) : undefined}
              exiting={fadeOut}
            >
              <Box
                testID={`${testID}-radio`}
                width={sizes.profile.radio}
                height={sizes.profile.radio}
                borderRadius="pill"
                borderColor="borderInput"
                style={{ borderWidth: sizes.profile.radioBorder }}
              />
            </Animated.View>
          ) : null}
        </Box>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  highlight: {
    position: 'absolute',
    top: -ROW_BORDER,
    left: -ROW_BORDER,
    right: -ROW_BORDER,
    bottom: -ROW_BORDER,
    borderWidth: ROW_BORDER,
  },
});

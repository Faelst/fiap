import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { strings } from '../constants/strings';
import { Card, Text, useTheme } from '../theme';

const AnimatedCard = Animated.createAnimatedComponent(Card);

type StudentCardProps = {
  fullName: string;
  rm: number;
  className: string;
  period: string;
  selected: boolean;
  onPress: () => void;
  testID: string;
};

/**
 * Card da seleção de aluno (01-design.md, 2.12). O selecionado tem borda
 * `primary`, que acende com `fast` (4.7); o outro tem borda transparente da
 * mesma largura, sem pulo de layout. Pressionado: escala 0,98.
 */
export function StudentCard({
  fullName,
  rm,
  className,
  period,
  selected,
  onPress,
  testID,
}: StudentCardProps) {
  const { colors, motion } = useTheme();
  const scale = useSharedValue(1);
  const borderColor = selected ? colors.primary : colors.transparent;

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(borderColor, { duration: motion.fast }),
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={strings.selectStudent.cardAccessibilityLabel(
        fullName,
        className,
        rm,
        period,
      )}
      accessibilityState={{ selected }}
      onPress={onPress}
      onPressIn={() => scale.set(withSpring(motion.pressScale, motion.press))}
      onPressOut={() => scale.set(withSpring(1, motion.press))}
    >
      <AnimatedCard
        testID={`${testID}-box`}
        variant="student"
        style={animatedStyle}
      >
        <Text variant="bodyMedium" textTransform="uppercase" numberOfLines={1}>
          {fullName}
        </Text>
        <Text variant="body">
          {strings.selectStudent.studentInfo(className, rm, period)}
        </Text>
      </AnimatedCard>
    </Pressable>
  );
}

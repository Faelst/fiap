import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box, Text, useTheme } from '../theme';

type PlaceholderAction = {
  label: string;
  onPress: () => void;
  testID: string;
};

type PlaceholderScreenProps = {
  testID: string;
  title: string;
  description: string;
  actions?: PlaceholderAction[];
};

/**
 * Tela provisória da Tarefa 7: valida tema, fonte, navegação e reanimated.
 * Cada tela real substitui a sua nas Tarefas 9 a 12.
 */
export function PlaceholderScreen({
  testID,
  title,
  description,
  actions = [],
}: PlaceholderScreenProps) {
  const { motion, sizes } = useTheme();

  return (
    <Box testID={testID} flex={1} backgroundColor="background">
      <SafeAreaView style={styles.fill} edges={['top']}>
        <Animated.View
          style={styles.fill}
          entering={FadeInDown.duration(motion.base)
            .easing(motion.easeOut)
            .reduceMotion(ReduceMotion.System)}
        >
          <Box
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingHorizontal="huge"
            gap="l"
          >
            <Text variant="sectionTitle">{title}</Text>
            <Text variant="body" textAlign="center">
              {description}
            </Text>
            {actions.map(action => (
              <Pressable
                key={action.testID}
                testID={action.testID}
                accessibilityRole="button"
                onPress={action.onPress}
                hitSlop={8}
              >
                <Box
                  minHeight={sizes.touchTarget}
                  justifyContent="center"
                  paddingHorizontal="l"
                  borderWidth={1}
                  borderColor="primary"
                  borderRadius="m"
                >
                  <Text variant="bodyBold" color="primary">
                    {action.label}
                  </Text>
                </Box>
              </Pressable>
            ))}
          </Box>
        </Animated.View>
      </SafeAreaView>
    </Box>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});

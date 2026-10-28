import { useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  type View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { LogoutIcon } from '../../../components/icons/LogoutIcon';
import { PillButton } from '../../../components/PillButton';
import { strings } from '../../../constants/strings';
import { Box, Text, useTheme } from '../../../theme';

type LogoutRowProps = {
  /** `profile-logout`; filhos: `-button`, `-cancel` e `-confirm`. */
  testID: string;
  /** Pediu para sair: a linha vira "Sair deste aparelho?" + Cancelar + Sair. */
  confirming: boolean;
  loggingOut: boolean;
  onAsk: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};

type HostRef = ComponentRef<typeof View>;

/**
 * "Sair da conta" com confirmação leve no mesmo lugar (01-design.md da v2,
 * 3.5, DV7): o 1º toque troca a linha por "Sair deste aparelho?" + Cancelar
 * + Sair, em crossfade e na mesma altura, sem modal. O foco do leitor de
 * tela acompanha a troca (6.4). Na tela estreita a pergunta some, os dois
 * botões dividem a largura e levam a pergunta no rótulo acessível.
 */
export function LogoutRow({
  testID,
  confirming,
  loggingOut,
  onAsk,
  onCancel,
  onConfirm,
}: LogoutRowProps) {
  const { breakpoints, colors, motion, sizes } = useTheme();
  const reducedMotion = useReducedMotion();
  const compact = useWindowDimensions().width < breakpoints.phone;
  const scale = useSharedValue(1);
  const buttonRef = useRef<HostRef>(null);
  const cancelRef = useRef<HostRef>(null);
  // Na 1ª visita a linha entra com a tela; o crossfade é só na troca.
  const [initialConfirming] = useState(confirming);
  const [toggled, setToggled] = useState(false);
  if (!toggled && confirming !== initialConfirming) setToggled(true);
  const previousConfirming = useRef(confirming);

  useEffect(() => {
    if (previousConfirming.current === confirming) return;
    previousConfirming.current = confirming;
    const target = confirming ? cancelRef.current : buttonRef.current;
    if (target) AccessibilityInfo.sendAccessibilityEvent(target, 'focus');
  }, [confirming]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));
  const pressIn = () => {
    if (!reducedMotion) scale.set(withSpring(motion.pressScale, motion.press));
  };
  const pressOut = () => {
    if (!reducedMotion) scale.set(withSpring(1, motion.press));
  };

  // Opacidade não é movimento: o crossfade fica com reduzir movimento.
  const entering = toggled
    ? FadeIn.duration(motion.base).reduceMotion(ReduceMotion.Never)
    : undefined;
  const exiting = FadeOut.duration(motion.base).reduceMotion(
    ReduceMotion.Never,
  );

  return (
    <Box testID={testID} height={sizes.profile.logoutRow}>
      {confirming ? (
        <Animated.View
          key="confirm"
          entering={entering}
          exiting={exiting}
          style={StyleSheet.absoluteFill}
        >
          <Box
            flex={1}
            flexDirection="row"
            alignItems="center"
            gap="s"
            paddingHorizontal="m"
            borderRadius="m"
            borderWidth={1}
            borderColor="borderSubtle"
            backgroundColor="surface"
          >
            {compact ? null : (
              <Text
                variant="bodyStrong"
                flex={1}
                numberOfLines={1}
                maxFontSizeMultiplier={sizes.fixedHeightFontScale}
              >
                {strings.profile.logoutConfirmQuestion}
              </Text>
            )}
            <Box flex={compact ? 1 : undefined}>
              <PillButton
                ref={cancelRef}
                testID={`${testID}-cancel`}
                label={strings.profile.logoutCancel}
                accessibilityLabel={
                  compact
                    ? strings.profile.logoutInContext(
                        strings.profile.logoutCancel,
                      )
                    : undefined
                }
                variant="secondary"
                size="xs"
                fullWidth={compact}
                disabled={loggingOut}
                onPress={onCancel}
              />
            </Box>
            <Box flex={compact ? 1 : undefined}>
              <PillButton
                testID={`${testID}-confirm`}
                label={strings.profile.logoutConfirm}
                accessibilityLabel={
                  compact
                    ? strings.profile.logoutInContext(
                        strings.profile.logoutConfirm,
                      )
                    : undefined
                }
                variant="danger"
                size="xs"
                fullWidth={compact}
                loading={loggingOut}
                loadingAccessibilityLabel={
                  strings.profile.loggingOutAccessibilityLabel
                }
                onPress={onConfirm}
              />
            </Box>
          </Box>
        </Animated.View>
      ) : (
        <Animated.View
          key="ask"
          entering={entering}
          exiting={exiting}
          style={StyleSheet.absoluteFill}
        >
          <Pressable
            ref={buttonRef}
            testID={`${testID}-button`}
            accessibilityRole="button"
            accessibilityLabel={strings.profile.logout}
            onPress={onAsk}
            onPressIn={pressIn}
            onPressOut={pressOut}
            style={styles.fill}
          >
            <Animated.View style={[styles.fill, scaleStyle]}>
              <Box
                testID={`${testID}-button-surface`}
                flex={1}
                flexDirection="row"
                alignItems="center"
                gap="sm"
                paddingHorizontal="m"
                borderRadius="m"
                borderWidth={1}
                borderColor="borderSubtle"
                backgroundColor="surface"
              >
                <LogoutIcon color={colors.danger} size={sizes.iconSmall} />
                <Text
                  variant="bodyStrong"
                  color="danger"
                  maxFontSizeMultiplier={sizes.fixedHeightFontScale}
                >
                  {strings.profile.logout}
                </Text>
              </Box>
            </Animated.View>
          </Pressable>
        </Animated.View>
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});

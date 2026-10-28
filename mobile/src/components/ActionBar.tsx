import { Image, Pressable } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';

import { strings } from '../constants/strings';
import { Box, Text, useTheme } from '../theme';
import { LogoutIcon } from './icons/LogoutIcon';

const logo = require('../../assets/logo-fiap-school.png');

type ActionBarProps = {
  canSwitchStudent: boolean;
  onSwitchStudent?: () => void;
  onLogout: () => void;
  logoutDisabled?: boolean;
};

/**
 * Barra de ações (01-design.md, 2.2): logo à esquerda; TROCAR PERFIL (só com
 * mais de um aluno) e SAIR à direita. Cada ação ocupa a altura da barra (48)
 * com `s` de padding, então o alvo passa de 44 × 44. Fixa no topo.
 */
export function ActionBar({
  canSwitchStudent,
  onSwitchStudent,
  onLogout,
  logoutDisabled = false,
}: ActionBarProps) {
  const { colors, motion, sizes } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(motion.base).reduceMotion(ReduceMotion.System)}
    >
      <Box
        testID="header-action-bar"
        height={sizes.actionBar}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="s"
        backgroundColor="background"
      >
        <Box paddingHorizontal="s">
          <Image
            source={logo}
            accessibilityRole="image"
            accessibilityLabel={strings.common.logoLabel}
            style={sizes.logoHeader}
          />
        </Box>
        <Box flexDirection="row" alignItems="center" gap="s">
          {canSwitchStudent ? (
            <Pressable
              testID="header-switch-student-button"
              accessibilityRole="button"
              accessibilityLabel={
                strings.header.switchStudentAccessibilityLabel
              }
              accessibilityHint={strings.header.switchStudentHint}
              onPress={onSwitchStudent}
              // A altura fica no próprio Pressable: é ele a área de toque (6.3).
              style={({ pressed }) => ({
                height: sizes.actionBar,
                opacity: pressed ? motion.pressedOpacity : 1,
              })}
            >
              <Box flex={1} justifyContent="center" paddingHorizontal="s">
                <Text
                  variant="caption"
                  maxFontSizeMultiplier={sizes.fixedHeightFontScale}
                >
                  {strings.header.switchStudent}
                </Text>
              </Box>
            </Pressable>
          ) : null}
          <Pressable
            testID="header-logout-button"
            accessibilityRole="button"
            accessibilityLabel={strings.header.logoutAccessibilityLabel}
            accessibilityState={{ disabled: logoutDisabled }}
            disabled={logoutDisabled}
            onPress={onLogout}
            // A altura fica no próprio Pressable: é ele a área de toque (6.3).
            style={({ pressed }) => ({
              height: sizes.actionBar,
              opacity: pressed ? motion.pressedOpacity : 1,
            })}
          >
            <Box
              flex={1}
              flexDirection="row"
              alignItems="center"
              gap="xs"
              paddingHorizontal="s"
            >
              <Text
                variant="caption"
                maxFontSizeMultiplier={sizes.fixedHeightFontScale}
              >
                {strings.header.logout}
              </Text>
              <LogoutIcon color={colors.text} size={sizes.logoutIcon} />
            </Box>
          </Pressable>
        </Box>
      </Box>
    </Animated.View>
  );
}

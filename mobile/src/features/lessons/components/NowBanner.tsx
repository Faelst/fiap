import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Platform, StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Entrance } from '../../../components/Entrance';
import { CheckIcon } from '../../../components/icons/CheckIcon';
import { ClockIcon } from '../../../components/icons/ClockIcon';
import { Box, Card, Text, useTheme } from '../../../theme';
import type { AgendaBanner } from '../useAgendaViewModel';

const MARKER = 8;
const ICON = 16;

/** Ponto teal com o anel pulsando (aula em andamento); parado com reduzir movimento. */
function PulsingDot() {
  const { colors, motion } = useTheme();
  const reducedMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    pulse.set(
      withRepeat(
        withTiming(1, {
          duration: motion.nowPulse.duration,
          easing: Easing.out(Easing.quad),
        }),
        -1,
      ),
    );
    return () => cancelAnimation(pulse);
  }, [pulse, reducedMotion, motion.nowPulse.duration]);

  const ring = useAnimatedStyle(() => ({
    opacity: reducedMotion ? 0 : 0.6 * (1 - pulse.get()),
    transform: [{ scale: 1 + pulse.get() * (motion.nowPulse.scaleTo - 1) }],
  }));

  const dot = { backgroundColor: colors.primary, borderRadius: MARKER / 2 };
  return (
    <Box width={MARKER} height={MARKER}>
      <Animated.View style={[StyleSheet.absoluteFill, dot, ring]} />
      <Box style={[StyleSheet.absoluteFill, dot]} />
    </Box>
  );
}

function Marker({ kind }: { kind: AgendaBanner['kind'] }) {
  const { colors } = useTheme();
  switch (kind) {
    case 'now':
      return <PulsingDot />;
    case 'break':
      return (
        <Box
          width={MARKER}
          height={MARKER}
          borderRadius="pill"
          backgroundColor="warning"
        />
      );
    case 'before':
      return <ClockIcon color={colors.textSecondary} size={ICON} />;
    case 'after':
      return <CheckIcon color={colors.textSecondary} size={ICON} />;
    default:
      return null;
  }
}

/**
 * Linha de status do dia acima da grade (01-design.md da v2, 2.8): na
 * página de hoje, a fase do relógio ("Agora: Ciências · até 10:45",
 * "Aulas encerradas"...); nos outros dias, o resumo. O texto só muda quando
 * a fase muda, num crossfade; o leitor de tela é avisado (só hoje e com a
 * página visível).
 */
export function NowBanner({
  banner,
  announce,
  testID,
}: {
  banner: AgendaBanner;
  /** Página de hoje visível: anuncia a troca de fase. */
  announce: boolean;
  testID: string;
}) {
  const { sizes } = useTheme();
  const message = `${banner.text}${banner.detail}`;
  const previous = useRef(message);

  useEffect(() => {
    if (previous.current === message) return;
    previous.current = message;
    // Um caminho por plataforma: no Android a live region do card (que já
    // existia) lê a troca; o anúncio explícito leria de novo.
    if (announce && Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [message, announce]);

  return (
    <Card
      testID={testID}
      variant="banner"
      minHeight={sizes.banner}
      justifyContent="center"
      accessible
      accessibilityLabel={message}
      accessibilityLiveRegion={announce ? 'polite' : 'none'}
    >
      <Entrance key={message}>
        <Box flexDirection="row" alignItems="center" gap="s">
          <Marker kind={banner.kind} />
          <Text
            testID={`${testID}-text`}
            variant="bodyStrong"
            flexShrink={1}
            numberOfLines={2}
          >
            {banner.text}
            <Text variant="body" color="textSecondary">
              {banner.detail}
            </Text>
          </Text>
        </Box>
      </Entrance>
    </Card>
  );
}

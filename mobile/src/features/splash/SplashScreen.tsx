import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Image, type LayoutChangeEvent } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../../navigation/types';
import { Box, useTheme } from '../../theme';
import { useSplashAnimation } from './useSplashAnimation';
import { useSplashViewModel } from './useSplashViewModel';

const logo = require('../../../assets/logo-fiap-school.png');

const LABEL = 'FIAP School';
const LOADING_LABEL = 'Carregando';

/**
 * Splash animada (01-design.md, 3.1). A nativa é só fundo preto; esta tela
 * assume no primeiro layout, esconde a nativa sem fade e dispara a timeline.
 */
export function SplashScreen({ navigation }: RootStackScreenProps<'Splash'>) {
  const { destination, showLoader, reducedMotion, onExitFinished } =
    useSplashViewModel(navigation);
  const { colors, sizes, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = sizes.logoLogin;
  const animation = useSplashAnimation({ reducedMotion, trackWidth: width });
  const { start, startLoop, exit, segmentWidth, styles } = animation;

  const started = useRef(false);
  const rootHeight = useRef(0);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      rootHeight.current = event.nativeEvent.layout.height;
      if (started.current) return;
      started.current = true;
      BootSplash.hide({ fade: false });
      start();
    },
    [start],
  );

  useEffect(() => {
    if (showLoader) startLoop();
  }, [showLoader, startLoop]);

  useEffect(() => {
    if (!destination) return;
    // Centro da tela → posição do logo no Login (inset de cima + hero).
    const centeredTop = (rootHeight.current - height) / 2;
    exit({
      destination,
      loginOffsetY: insets.top + spacing.hero - centeredTop,
      onFinished: onExitFinished,
    });
  }, [destination, exit, height, insets.top, spacing.hero, onExitFinished]);

  const layers = useMemo(() => {
    const badge = sizes.logoBadge;
    const badgeRect = {
      position: 'absolute' as const,
      left: badge.x * width,
      top: badge.y * height,
      width: badge.width * width,
      height: badge.height * height,
    };
    return {
      logo: { width, height },
      // A capa sangra um pouco para fora do selo: o antialias da borda rosa
      // do PNG não aparece durante o wipe. Fora do selo o PNG é transparente,
      // então a sobra preta some no fundo preto.
      cover: {
        position: 'absolute' as const,
        left: badgeRect.left - sizes.logoBadgeBleed,
        top: badgeRect.top - sizes.logoBadgeBleed,
        width: badgeRect.width + sizes.logoBadgeBleed * 2,
        height: badgeRect.height + sizes.logoBadgeBleed * 2,
        backgroundColor: colors.background,
      },
      badge: { ...badgeRect, overflow: 'hidden' as const },
      badgeImage: {
        position: 'absolute' as const,
        left: -badgeRect.left,
        top: -badgeRect.top,
        width,
        height,
      },
      mask: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: width + sizes.scanLine.width,
        height,
        backgroundColor: colors.background,
      },
      scan: {
        position: 'absolute' as const,
        top: -sizes.scanLine.overhang,
        left: 0,
        width: sizes.scanLine.width,
        height: height + sizes.scanLine.overhang * 2,
        backgroundColor: colors.primary,
      },
      // Abaixo do logo, fora do fluxo: o logo fica no centro exato da tela.
      track: {
        position: 'absolute' as const,
        top: height + spacing.l,
        left: 0,
        width,
        height: sizes.splashTrack,
        overflow: 'hidden' as const,
        backgroundColor: colors.inputLine,
      },
      segment: {
        width: segmentWidth,
        height: '100%' as const,
        backgroundColor: colors.primary,
      },
    };
  }, [colors, sizes, spacing.l, width, height, segmentWidth]);

  return (
    <Box
      testID="splash-screen"
      accessibilityLabel={LABEL}
      flex={1}
      backgroundColor="background"
      alignItems="center"
      justifyContent="center"
      onLayout={onLayout}
    >
      <Box width={width} height={height}>
        <Animated.View
          testID="splash-logo"
          accessible
          accessibilityRole="image"
          accessibilityLabel={LABEL}
          style={[layers.logo, styles.group]}
        >
          <Box
            width={width}
            height={height}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          >
            <Box width={width} height={height} overflow="hidden">
              <Image source={logo} style={layers.logo} />
              <Box style={layers.cover} />
              <Animated.View style={[layers.badge, styles.badge]}>
                <Image source={logo} style={layers.badgeImage} />
              </Animated.View>
              {reducedMotion ? null : (
                <Animated.View style={[layers.mask, styles.mask]} />
              )}
            </Box>
            {reducedMotion ? null : (
              <Animated.View style={[layers.scan, styles.scan]} />
            )}
          </Box>
        </Animated.View>

        <Animated.View
          testID="splash-loading"
          accessible={showLoader}
          accessibilityRole="progressbar"
          accessibilityLabel={LOADING_LABEL}
          accessibilityElementsHidden={!showLoader}
          importantForAccessibility={showLoader ? 'yes' : 'no-hide-descendants'}
          style={[layers.track, styles.loader]}
        >
          <Animated.View style={[layers.segment, styles.segment]} />
        </Animated.View>
      </Box>
    </Box>
  );
}

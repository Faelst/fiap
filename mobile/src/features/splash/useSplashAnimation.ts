import { useCallback } from 'react';
import {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useTheme } from '../../theme';
import type { SplashDestination } from './useSplashViewModel';

type Options = {
  reducedMotion: boolean;
  /** Largura do trilho de espera (a do logo). */
  trackWidth: number;
};

type ExitOptions = {
  destination: SplashDestination;
  /** Deslocamento do centro até a posição do logo do Login. */
  loginOffsetY: number;
  onFinished: () => void;
};

const linear = Easing.linear;

/**
 * Opacidade não é movimento (01-design.md, 3.1.6): estes fades acontecem
 * mesmo com "reduzir movimento". Sem isto o reanimated 4 usa
 * `ReduceMotion.System` e pula direto para o valor final.
 */
const keepWithReducedMotion = { reduceMotion: ReduceMotion.Never };

/**
 * Timeline da splash (01-design.md, 3.1.3 a 3.1.6), toda em shared values no
 * UI thread. Cada função dispara as animações de uma vez; o JS não participa
 * enquanto elas rodam. O fim da saída volta ao JS por `scheduleOnRN`.
 */
export function useSplashAnimation({ reducedMotion, trackWidth }: Options) {
  const { motion, sizes } = useTheme();
  const splash = motion.splash;
  const segmentWidth = trackWidth * splash.loopTrackSegment;
  const segmentCenter = (trackWidth - segmentWidth) / 2;

  // Com reduzir movimento, o logo já nasce montado (selo à vista, escala 1)
  // e só a opacidade do grupo anima.
  const groupOpacity = useSharedValue(reducedMotion ? 0 : 1);
  const groupScale = useSharedValue(reducedMotion ? 1 : splash.scaleFrom);
  const groupY = useSharedValue(0);
  const wipeX = useSharedValue(0);
  const scanOpacity = useSharedValue(0);
  const badgeOpacity = useSharedValue(reducedMotion ? 1 : 0);
  const badgeScale = useSharedValue(reducedMotion ? 1 : splash.badgeScaleFrom);
  const badgeBreath = useSharedValue(1);
  const loaderOpacity = useSharedValue(0);
  const loaderX = useSharedValue(reducedMotion ? segmentCenter : -segmentWidth);

  const start = useCallback(() => {
    if (reducedMotion) {
      groupOpacity.set(
        withTiming(1, {
          duration: splash.fadeInReduced,
          easing: linear,
          ...keepWithReducedMotion,
        }),
      );
      return;
    }
    const { delay, duration } = splash.wipe;
    wipeX.set(
      withDelay(
        delay,
        withTiming(sizes.logoLogin.width + sizes.scanLine.width, {
          duration,
          easing: splash.wipeEasing,
        }),
      ),
    );
    scanOpacity.set(
      withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: splash.scanFadeIn, easing: linear }),
          withDelay(
            duration - splash.scanFadeIn - splash.scanFadeOut,
            withTiming(0, { duration: splash.scanFadeOut, easing: linear }),
          ),
        ),
      ),
    );
    groupScale.set(
      withDelay(
        delay,
        withTiming(1, {
          duration: splash.scaleDuration,
          easing: motion.easeOut,
        }),
      ),
    );
    badgeOpacity.set(
      withDelay(
        splash.badgeAt,
        withTiming(1, { duration: splash.badgeFadeIn, easing: linear }),
      ),
    );
    badgeScale.set(
      withDelay(splash.badgeAt, withSpring(1, splash.badgeSpring)),
    );
  }, [
    reducedMotion,
    splash,
    sizes.logoLogin.width,
    sizes.scanLine.width,
    motion.easeOut,
    groupOpacity,
    wipeX,
    scanOpacity,
    groupScale,
    badgeOpacity,
    badgeScale,
  ]);

  const startLoop = useCallback(() => {
    loaderOpacity.set(
      withTiming(1, { duration: motion.fast, ...keepWithReducedMotion }),
    );
    if (reducedMotion) {
      // Trilho parado, segmento no centro.
      return;
    }
    loaderX.set(
      withRepeat(
        withTiming(trackWidth, {
          duration: splash.loopTrack,
          easing: Easing.inOut(Easing.cubic),
        }),
        -1,
        false,
      ),
    );
    const half = splash.badgeBreath / 2;
    const breathEasing = Easing.inOut(Easing.sin);
    badgeBreath.set(
      withRepeat(
        withSequence(
          withTiming(splash.badgeBreathScale, {
            duration: half,
            easing: breathEasing,
          }),
          withTiming(1, { duration: half, easing: breathEasing }),
        ),
        -1,
        false,
      ),
    );
  }, [
    reducedMotion,
    trackWidth,
    splash,
    motion.fast,
    loaderOpacity,
    loaderX,
    badgeBreath,
  ]);

  const exit = useCallback(
    ({ destination, loginOffsetY, onFinished }: ExitOptions) => {
      // Para o loop sem esperar o ciclo acabar.
      cancelAnimation(loaderX);
      cancelAnimation(badgeBreath);
      const fade = { duration: motion.fast, ...keepWithReducedMotion };
      loaderOpacity.set(withTiming(0, fade));
      badgeBreath.set(withTiming(1, fade));

      const done = (finished?: boolean) => {
        'worklet';
        if (finished) scheduleOnRN(onFinished);
      };

      if (reducedMotion) {
        groupOpacity.set(withTiming(0, { ...fade, easing: linear }, done));
        return;
      }
      if (destination === 'login') {
        // Até o lugar do logo do Login, já no tamanho dele (0,8): os dois
        // transforms juntos, no mesmo grupo (01-design.md da v2, 3.1).
        const toLogin = {
          duration: motion.slow,
          easing: splash.exitToLoginEasing,
        };
        groupScale.set(withTiming(motion.loginLogoScale, toLogin));
        groupY.set(withTiming(loginOffsetY, toLogin, done));
        return;
      }
      const config = { duration: splash.exitDuration, easing: motion.easeIn };
      groupScale.set(withTiming(splash.exitScaleTo, config));
      groupOpacity.set(withTiming(0, config, done));
    },
    [
      reducedMotion,
      splash,
      motion.fast,
      motion.slow,
      motion.easeIn,
      motion.loginLogoScale,
      loaderX,
      badgeBreath,
      loaderOpacity,
      groupOpacity,
      groupY,
      groupScale,
    ],
  );

  const groupStyle = useAnimatedStyle(() => ({
    opacity: groupOpacity.get(),
    transform: [{ translateY: groupY.get() }, { scale: groupScale.get() }],
  }));
  const maskStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: wipeX.get() }],
  }));
  const scanStyle = useAnimatedStyle(() => ({
    opacity: scanOpacity.get(),
    transform: [{ translateX: wipeX.get() }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.get(),
    transform: [{ scale: badgeScale.get() * badgeBreath.get() }],
  }));
  const loaderStyle = useAnimatedStyle(() => ({
    opacity: loaderOpacity.get(),
  }));
  const segmentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: loaderX.get() }],
  }));

  return {
    start,
    startLoop,
    exit,
    segmentWidth,
    styles: {
      group: groupStyle,
      mask: maskStyle,
      scan: scanStyle,
      badge: badgeStyle,
      loader: loaderStyle,
      segment: segmentStyle,
    },
  };
}

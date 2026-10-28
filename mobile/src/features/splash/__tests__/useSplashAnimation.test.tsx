import { ThemeProvider } from '@shopify/restyle';
import { renderHook } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { ReduceMotion, withTiming } from 'react-native-reanimated';

import { theme } from '../../../theme';
import { useSplashAnimation } from '../useSplashAnimation';

jest.mock('react-native-reanimated', () => {
  const mock = require('react-native-reanimated/mock');
  return {
    ...mock,
    withTiming: jest.fn(
      (value: unknown, _config: unknown, callback?: (f: boolean) => void) => {
        callback?.(true);
        return value;
      },
    ),
  };
});

const timing = jest.mocked(withTiming);

const wrapper = ({ children }: PropsWithChildren) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

/** Configs dos withTiming chamados (o 2º argumento). */
const configs = () =>
  timing.mock.calls.map(([, config]) => config as { reduceMotion?: unknown });

describe('useSplashAnimation com reduzir movimento', () => {
  beforeEach(() => timing.mockClear());

  const setup = async () => {
    const { result } = await renderHook(
      () => useSplashAnimation({ reducedMotion: true, trackWidth: 306 }),
      { wrapper },
    );
    return result.current;
  };

  // O padrão do reanimated 4 (ReduceMotion.System) pula a animação quando o
  // ajuste do sistema está ligado; os fades do design 3.1.6 têm de acontecer.
  it('o fade de entrada não é pulado pelo sistema', async () => {
    const animation = await setup();
    animation.start();

    expect(configs()).toEqual([
      expect.objectContaining({ reduceMotion: ReduceMotion.Never }),
    ]);
  });

  it('o trilho de espera aparece com fade, sem ser pulado', async () => {
    const animation = await setup();
    animation.startLoop();

    expect(configs()).toEqual([
      expect.objectContaining({ reduceMotion: ReduceMotion.Never }),
    ]);
  });

  it.each(['login', 'app'] as const)(
    'a saída para %s é um fade que não é pulado',
    async destination => {
      const animation = await setup();
      const onFinished = jest.fn();
      animation.exit({ destination, loginOffsetY: -200, onFinished });

      // trilho → 0, selo → 1 e o fade do grupo
      expect(configs()).toHaveLength(3);
      for (const config of configs()) {
        expect(config).toMatchObject({ reduceMotion: ReduceMotion.Never });
      }
    },
  );
});

describe('useSplashAnimation: saída para o Login (3.1 da v2)', () => {
  beforeEach(() => timing.mockClear());

  it('desce até o logo do Login e encolhe para 0,8 juntos, em slow com emphasized', async () => {
    const { result } = await renderHook(
      () => useSplashAnimation({ reducedMotion: false, trackWidth: 306 }),
      { wrapper },
    );
    const onFinished = jest.fn();

    result.current.exit({
      destination: 'login',
      loginOffsetY: -200.5,
      onFinished,
    });

    const { motion } = theme;
    const exitConfig = {
      duration: motion.slow,
      easing: motion.splash.exitToLoginEasing,
    };
    expect(timing).toHaveBeenCalledWith(-200.5, exitConfig, expect.anything());
    expect(timing).toHaveBeenCalledWith(motion.loginLogoScale, exitConfig);
    // Troca de tela uma vez só, no fim do grupo.
    await Promise.resolve();
    expect(onFinished).toHaveBeenCalledTimes(1);
  });
});

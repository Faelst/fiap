import { screen } from '@testing-library/react-native';
import {
  cancelAnimation,
  Easing,
  useReducedMotion,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { shimmerTranslateX, Skeleton, SkeletonGroup } from '../Skeleton';

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated/mock');
  return {
    ...actual,
    useReducedMotion: jest.fn(() => false),
    withRepeat: jest.fn(actual.withRepeat),
    withTiming: jest.fn(actual.withTiming),
    cancelAnimation: jest.fn(),
  };
});

const reducedMotionMock = useReducedMotion as jest.Mock;
const { colors, motion, sizes } = theme;

beforeEach(() => {
  jest.clearAllMocks();
  reducedMotionMock.mockReturnValue(false);
});

describe('Skeleton', () => {
  it('bloco em surfaceHigh, no tamanho e no raio pedidos, cortando o que passa', async () => {
    await renderWithTheme(
      <SkeletonGroup>
        <Skeleton testID="bloco" width={180} height={16} radius="xs" />
      </SkeletonGroup>,
    );

    expect(screen.getByTestId('bloco')).toHaveStyle({
      width: 180,
      height: 16,
      borderRadius: theme.borderRadii.xs,
      backgroundColor: colors.surfaceHigh,
      overflow: 'hidden',
    });
  });

  it('um loop linear por grupo, de 0 a 1 em `shimmer.duration`, sem fim', async () => {
    await renderWithTheme(
      <SkeletonGroup>
        <Skeleton testID="a" width={100} height={16} />
        <Skeleton testID="b" width={100} height={16} />
      </SkeletonGroup>,
    );

    expect(withTiming).toHaveBeenCalledWith(1, {
      duration: motion.shimmer.duration,
      easing: Easing.linear,
    });
    expect(withRepeat).toHaveBeenCalledTimes(1);
    expect(withRepeat).toHaveBeenCalledWith(expect.anything(), -1);
  });

  it('a faixa do shimmer tem a largura do tema e mede o bloco', async () => {
    await renderWithTheme(
      <SkeletonGroup>
        <Skeleton testID="bloco" height={60} />
      </SkeletonGroup>,
    );

    expect(screen.getByTestId('bloco-shimmer')).toHaveStyle({
      width: sizes.skeleton.shimmerWidth,
    });
    expect(screen.getByTestId('bloco-track')).toHaveProp(
      'onLayout',
      expect.any(Function),
    );
  });

  it('o loop é cancelado ao desmontar', async () => {
    const { unmount } = await renderWithTheme(
      <SkeletonGroup>
        <Skeleton testID="bloco" height={60} />
      </SkeletonGroup>,
    );

    await unmount();

    expect(cancelAnimation).toHaveBeenCalled();
  });

  it('com reduzir movimento: sem faixa nem loop, bloco parado em 0,7', async () => {
    reducedMotionMock.mockReturnValue(true);
    await renderWithTheme(
      <SkeletonGroup>
        <Skeleton testID="bloco" height={60} />
      </SkeletonGroup>,
    );

    expect(screen.queryByTestId('bloco-shimmer')).toBeNull();
    expect(withRepeat).not.toHaveBeenCalled();
    expect(screen.getByTestId('bloco')).toHaveStyle({
      opacity: motion.shimmer.reducedOpacity,
    });
  });

  it('fora de um grupo é só o bloco (skeletons da v1, que pulsam por fora)', async () => {
    await renderWithTheme(
      <Skeleton testID="bloco" radius="round" height={6} />,
    );

    expect(screen.queryByTestId('bloco-shimmer')).toBeNull();
    expect(screen.getByTestId('bloco')).toHaveStyle({
      borderRadius: 999,
      backgroundColor: colors.surfaceHigh,
    });
  });
});

describe('shimmerTranslateX', () => {
  it('atravessa o bloco: de −faixa (fora, à esquerda) até a largura dele', () => {
    expect(shimmerTranslateX(0, 300, 120)).toBe(-120);
    expect(shimmerTranslateX(0.5, 300, 120)).toBe(90);
    expect(shimmerTranslateX(1, 300, 120)).toBe(300);
  });
});

describe('degradê da faixa', () => {
  it('as pontas são transparentes e o meio é branco a 7 % (alfa chega ao svg)', async () => {
    const { toJSON } = await renderWithTheme(
      <SkeletonGroup>
        <Skeleton testID="bloco" height={60} />
      </SkeletonGroup>,
    );

    // O svg recebe [offset, ARGB, ...]; o alfa é o byte mais alto.
    const json = JSON.stringify(toJSON());
    const gradient = JSON.parse(
      json.match(/"gradient":(\[[^\]]*\])/)?.[1] ?? '[]',
    ) as number[];
    const alphas = gradient
      .filter((_, index) => index % 2 === 1)
      .map(argb => Math.floor(argb / 2 ** 24));
    expect(alphas).toEqual([0, Math.round(0.07 * 255), 0]);
  });
});

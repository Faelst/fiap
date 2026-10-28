import { palette } from '../palette';
import { theme } from '../theme';

describe('tema v2', () => {
  it('toda cor semântica vem da paleta', () => {
    const allowed = new Set<string>([...Object.values(palette), 'transparent']);
    for (const [name, value] of Object.entries(theme.colors)) {
      expect({ name, ok: allowed.has(value) }).toEqual({ name, ok: true });
    }
  });

  it('cores novas da v2 (1.2)', () => {
    expect(theme.colors).toMatchObject({
      background: '#000000',
      surfaceSunken: '#0B0B0B',
      surface: '#141414',
      surfaceRaised: '#1E1E1E',
      surfaceHigh: '#2A2A2A',
      borderSubtle: '#262626',
      borderStrong: '#3A3A3A',
      borderInput: '#6E6E6E',
      primary: '#29F4D5',
      primaryMuted: '#17332F',
      accent: '#ED145B',
      accentMuted: '#37141F',
      danger: '#FF5C8D',
      warning: '#FFB547',
      warningMuted: '#352B1B',
      text: '#FFFFFF',
      textSecondary: '#B3B3B3',
      textTertiary: '#8C8C8C',
      textDisabled: '#808080',
      textOnPrimary: '#000000',
    });
  });

  it('as cores com alfa ficam fora de `colors`', () => {
    const values = Object.values(theme.colors) as string[];
    for (const alpha of [palette.glowTeal, palette.shadowBlack]) {
      expect(values).not.toContain(alpha);
    }
  });

  it('raios (1.5) e o espaçamento xxs (1.4)', () => {
    expect(theme.borderRadii).toEqual({
      none: 0,
      xs: 6,
      s: 10,
      m: 14,
      l: 20,
      xl: 28,
      pill: 999,
      round: 999,
    });
    expect(theme.spacing.xxs).toBe(2);
  });

  it('sombras são BoxShadowValue com as cores da paleta (1.6)', () => {
    expect(theme.shadows.glowPrimary).toEqual({
      offsetX: 0,
      offsetY: 0,
      blurRadius: 16,
      spreadDistance: 0,
      color: palette.glowTeal,
    });
    expect(theme.shadows.glowPrimarySoft).toEqual({
      ...theme.shadows.glowPrimary,
      blurRadius: 8,
    });
    expect(theme.shadows.floating).toEqual({
      offsetX: 0,
      offsetY: 8,
      blurRadius: 24,
      spreadDistance: 0,
      color: palette.shadowBlack,
    });
  });

  it('degradês (1.6) e opacidades (1.7)', () => {
    // O `Stop` do react-native-svg ignora o alfa de um rgba no `stopColor`:
    // cada parada leva a cor opaca e a opacidade separadas (`stopOpacity`).
    expect(theme.gradients.tabBarFade).toEqual([
      { color: palette.black, opacity: 0 },
      { color: palette.black, opacity: 1 },
    ]);
    expect(theme.gradients.shimmer).toEqual([
      { color: palette.white, opacity: 0 },
      { color: palette.white, opacity: 0.07 },
      { color: palette.white, opacity: 0 },
    ]);
    expect(theme.gradients.loginHalo).toEqual({
      color: palette.teal,
      centerOpacity: 0.1,
      edgeOpacity: 0,
    });
    expect(theme.opacities).toEqual({
      past: 0.72,
      pressed: 0.6,
      busy: 0.6,
      hidden: 0,
    });
  });

  it('tamanhos novos e alterados (1.9)', () => {
    expect(theme.sizes).toMatchObject({
      iconSmall: 20,
      iconStroke: 1.9,
      headerBar: 56,
      logoHeader: { width: 80, height: 13 },
      logoLoginV2: { width: 245, height: 39 },
      formMaxWidth: 400,
      avatar: { s: 28, m: 44, l: 56 },
      pill: { md: 56, sm: 44, xs: 32 },
      emptyIcon: { circle: 64, glyph: 28 },
      skeleton: {
        blockHeights: [60, 60, 60, 60],
        subjectCards: 4,
        shimmerWidth: 120,
      },
    });
  });

  it('movimento (1.10): adições e mudanças', () => {
    expect(theme.motion).toMatchObject({
      slower: 450,
      pressScale: 0.97,
      pressScaleSmall: 0.94,
      cardStagger: 50,
      stripStagger: 20,
      spring: {
        snappy: { damping: 22, stiffness: 320, mass: 1 },
        gentle: { damping: 20, stiffness: 170, mass: 1 },
        pop: { damping: 12, stiffness: 220, mass: 0.8 },
      },
      shimmer: { duration: 1200, reducedOpacity: 0.7 },
      nowTick: 60_000,
    });
    // Razão entre o logo do login e o da splash (245 / 306).
    expect(theme.motion.loginLogoScale).toBeCloseTo(0.8, 2);
    expect(theme.motion.emphasized).toBe(theme.motion.splash.exitToLoginEasing);
  });
});

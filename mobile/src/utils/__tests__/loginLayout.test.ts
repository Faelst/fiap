import {
  loginLogoCenterY,
  loginLogoTop,
  splashToLoginOffsetY,
} from '../loginLayout';

describe('loginLogoTop', () => {
  // Casos do 01-design.md da v2, 3.2 (status bar de 20, sem home indicator).
  it.each([
    [736, 128],
    [667, 93],
    [568, 64],
  ])('janela de %i de altura: logo a %i do inset de cima', (height, top) => {
    expect(loginLogoTop({ windowHeight: height, insetTop: 20 })).toBe(top);
  });

  it('desconta o inset de baixo (home indicator)', () => {
    // (852 − 59 − 34 − 460) / 2 = 149,5 → 149
    expect(
      loginLogoTop({ windowHeight: 852, insetTop: 59, insetBottom: 34 }),
    ).toBe(149);
  });

  it('nunca fica a menos de `spacing.section` (64) do topo', () => {
    expect(loginLogoTop({ windowHeight: 400, insetTop: 20 })).toBe(64);
  });
});

describe('loginLogoCenterY', () => {
  it('centro do logo de 245 × 39 do Login, contado do topo da janela', () => {
    // 20 + 128 + 39 / 2
    expect(loginLogoCenterY({ windowHeight: 736, insetTop: 20 })).toBe(167.5);
  });
});

describe('splashToLoginOffsetY', () => {
  it('leva o centro da splash (meio da tela) ao centro do logo do Login', () => {
    // 167,5 − 736 / 2
    expect(
      splashToLoginOffsetY({
        rootHeight: 736,
        windowHeight: 736,
        insetTop: 20,
      }),
    ).toBe(-200.5);
  });
});

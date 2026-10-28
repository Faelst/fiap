import { fireEvent, screen } from '@testing-library/react-native';
import { createRef, type ComponentRef } from 'react';
import { StyleSheet, Text, type View } from 'react-native';

import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { PillButton } from '../PillButton';

const { colors, shadows, sizes } = theme;

const surface = () => screen.getByTestId('btn-surface');

describe('PillButton', () => {
  it('primário: pílula de 56 em primary, com brilho, texto textOnPrimary e chama onPress', async () => {
    const onPress = jest.fn();
    await renderWithTheme(
      <PillButton testID="btn" label="Entrar" onPress={onPress} />,
    );

    const button = screen.getByTestId('btn');
    expect(button).toHaveProp('accessibilityRole', 'button');
    expect(button).toHaveAccessibleName('Entrar');
    expect(surface()).toHaveStyle({
      height: sizes.pill.md,
      borderRadius: 999,
      backgroundColor: colors.primary,
      paddingHorizontal: theme.spacing.l,
      boxShadow: [shadows.glowPrimary],
    });
    expect(screen.getByText('Entrar')).toHaveStyle({
      color: colors.textOnPrimary,
      fontFamily: 'Montserrat-SemiBold',
      fontSize: 16,
    });
    expect(screen.getByText('Entrar')).toHaveProp(
      'maxFontSizeMultiplier',
      sizes.fixedHeightFontScale,
    );

    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('secundário: surfaceRaised com borda forte, texto text e ícone em primary', async () => {
    const icon = jest.fn((color: string) => <Text>ícone {color}</Text>);
    await renderWithTheme(
      <PillButton
        testID="btn"
        label="Tentar de novo"
        variant="secondary"
        icon={icon}
        onPress={jest.fn()}
      />,
    );

    expect(surface()).toHaveStyle({
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.borderStrong,
      borderWidth: 1,
    });
    expect(StyleSheet.flatten(surface().props.style).boxShadow).toBeUndefined();
    expect(screen.getByText('Tentar de novo')).toHaveStyle({
      color: colors.text,
    });
    expect(icon).toHaveBeenCalledWith(colors.primary);
  });

  it('ghost: sem fundo, texto e ícone em primary', async () => {
    const icon = jest.fn(() => null);
    await renderWithTheme(
      <PillButton
        testID="btn"
        label="Hoje"
        variant="ghost"
        size="xs"
        icon={icon}
        onPress={jest.fn()}
      />,
    );

    expect(surface()).toHaveStyle({ backgroundColor: 'transparent' });
    expect(screen.getByText('Hoje')).toHaveStyle({ color: colors.primary });
    expect(icon).toHaveBeenCalledWith(colors.primary);
  });

  it('perigo: fundo danger com texto textOnPrimary', async () => {
    await renderWithTheme(
      <PillButton
        testID="btn"
        label="Sair"
        variant="danger"
        onPress={jest.fn()}
      />,
    );

    expect(surface()).toHaveStyle({ backgroundColor: colors.danger });
    expect(screen.getByText('Sair')).toHaveStyle({
      color: colors.textOnPrimary,
    });
  });

  it('desabilitado: surfaceHigh, texto textDisabled, sem brilho e sem toque', async () => {
    const onPress = jest.fn();
    const icon = jest.fn(() => null);
    await renderWithTheme(
      <PillButton
        testID="btn"
        label="Entrar"
        icon={icon}
        disabled
        onPress={onPress}
      />,
    );

    const button = screen.getByTestId('btn');
    expect(button).toBeDisabled();
    expect(surface()).toHaveStyle({ backgroundColor: colors.surfaceHigh });
    expect(StyleSheet.flatten(surface().props.style).boxShadow).toBeUndefined();
    expect(screen.getByText('Entrar')).toHaveStyle({
      color: colors.textDisabled,
    });
    expect(icon).toHaveBeenCalledWith(colors.textDisabled);

    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  describe('carregando', () => {
    it('spinner na cor do texto, rótulo invisível mas no layout, busy e sem toque', async () => {
      const onPress = jest.fn();
      await renderWithTheme(
        <PillButton
          testID="btn"
          label="Entrar"
          accessibilityLabel="Entrar no app"
          loadingAccessibilityLabel="Entrando…"
          loading
          onPress={onPress}
        />,
      );

      const button = screen.getByTestId('btn');
      expect(button).toBeBusy();
      expect(button).toHaveAccessibleName('Entrando…');
      expect(screen.getByTestId('btn-loading')).toHaveProp(
        'color',
        colors.textOnPrimary,
      );
      // A largura não muda: o rótulo continua montado, com opacidade 0.
      expect(
        screen.getByTestId('btn-label', { includeHiddenElements: true }),
      ).toHaveStyle({ opacity: 0 });

      await fireEvent.press(button);
      expect(onPress).not.toHaveBeenCalled();
    });

    it('sem carregar, não há spinner e o rótulo aparece', async () => {
      await renderWithTheme(
        <PillButton testID="btn" label="Entrar" onPress={jest.fn()} />,
      );

      expect(screen.queryByTestId('btn-loading')).toBeNull();
      expect(screen.getByTestId('btn-label')).toHaveStyle({ opacity: 1 });
      expect(screen.getByTestId('btn')).not.toBeBusy();
    });
  });

  describe('tamanhos', () => {
    it('sm: 44 de altura, buttonSmall e sem hitSlop (já tem 44)', async () => {
      await renderWithTheme(
        <PillButton testID="btn" label="Sair" size="sm" onPress={jest.fn()} />,
      );

      expect(surface()).toHaveStyle({
        height: sizes.pill.sm,
        paddingHorizontal: theme.spacing.m,
      });
      expect(screen.getByText('Sair')).toHaveStyle({ fontSize: 14 });
      expect(screen.getByTestId('btn')).toHaveProp('hitSlop', {
        top: 0,
        bottom: 0,
      });
    });

    it('xs: 32 de altura e hitSlop até 44', async () => {
      await renderWithTheme(
        <PillButton testID="btn" label="Hoje" size="xs" onPress={jest.fn()} />,
      );

      expect(surface()).toHaveStyle({
        height: sizes.pill.xs,
        paddingHorizontal: theme.spacing.sm,
      });
      expect(screen.getByTestId('btn')).toHaveProp('hitSlop', {
        top: 6,
        bottom: 6,
      });
    });
  });

  it('ícone no fim quando pedido', async () => {
    await renderWithTheme(
      <PillButton
        testID="btn"
        label="Ver perfil"
        iconPosition="end"
        icon={() => <Text>seta</Text>}
        onPress={jest.fn()}
      />,
    );

    const texts = screen
      .getAllByText(/Ver perfil|seta/)
      .map(node => String(node.props.children));
    expect(texts).toEqual(['Ver perfil', 'seta']);
  });

  it('largura total ocupa a linha; senão, só o conteúdo', async () => {
    const { rerender } = await renderWithTheme(
      <PillButton testID="btn" label="Entrar" fullWidth onPress={jest.fn()} />,
    );
    expect(screen.getByTestId('btn')).toHaveStyle({ alignSelf: 'stretch' });

    await rerender(
      <PillButton testID="btn" label="Entrar" onPress={jest.fn()} />,
    );
    expect(screen.getByTestId('btn')).toHaveStyle({ alignSelf: 'center' });
  });

  it('repassa a dica de acessibilidade', async () => {
    await renderWithTheme(
      <PillButton
        testID="btn"
        label="Sair"
        accessibilityHint="Encerra a sessão"
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByTestId('btn')).toHaveProp(
      'accessibilityHint',
      'Encerra a sessão',
    );
  });

  it('repassa o `ref` ao pressionável (para mover o foco do leitor até ele)', async () => {
    const ref = createRef<ComponentRef<typeof View>>();
    await renderWithTheme(
      <PillButton
        testID="btn"
        label="Cancelar"
        onPress={jest.fn()}
        ref={ref}
      />,
    );

    // A instância é a do próprio pressionável (o que tem o testID do botão).
    expect(ref.current).toHaveProperty('props.testID', 'btn');
  });
});

import { fireEvent, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  Text,
  type TextInputInstance,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import type { RecordedAnimation } from '../../test/recordingAnimations';
import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { TextField, type TextFieldProps } from '../TextField';

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated/mock');
  return {
    ...actual,
    ...jest
      .requireActual('../../test/recordingAnimations')
      .recordingAnimations(),
    useReducedMotion: jest.fn(() => false),
  };
});

const { borderRadii, colors, motion, opacities, shadows, sizes, spacing } =
  theme;
const reducedMotionMock = useReducedMotion as jest.Mock;
const hidden = { includeHiddenElements: true };

const renderField = (props: Partial<TextFieldProps> = {}) =>
  renderWithTheme(
    <TextField
      testID="campo"
      label="CPF"
      icon={color => <Text>ícone {color}</Text>}
      value=""
      onChangeText={jest.fn()}
      {...props}
    />,
  );

const input = () => screen.getByTestId('campo');
const style = (testID: string) =>
  StyleSheet.flatten(screen.getByTestId(testID, hidden).props.style);
const entering = (testID: string) =>
  (
    screen.getByTestId(testID, hidden) as unknown as {
      props: { entering?: RecordedAnimation };
    }
  ).props.entering;

/** Deslocamento do rótulo flutuando (2.5): −(m − xxs). */
const raisedY = -(spacing.m - spacing.xxs);

beforeEach(() => {
  jest.clearAllMocks();
  reducedMotionMock.mockReturnValue(false);
});

describe('TextField', () => {
  it('caixa de 60 com raio m, fundo afundado, borda de campo e o ícone em textSecondary', async () => {
    await renderField();

    expect(style('campo-box')).toMatchObject({
      height: sizes.textField,
      borderRadius: borderRadii.m,
      backgroundColor: colors.surfaceSunken,
      borderColor: colors.borderInput,
      borderWidth: 1,
    });
    expect(screen.getByText(`ícone ${colors.textSecondary}`)).toBeOnTheScreen();
  });

  it('o TextInput tem o rótulo para o leitor, cursor teal e teto de fonte', async () => {
    await renderField();

    expect(input()).toHaveProp('accessibilityLabel', 'CPF');
    expect(input()).toHaveProp('selectionColor', colors.primary);
    expect(input()).toHaveProp('cursorColor', colors.primary);
    expect(input()).toHaveProp(
      'maxFontSizeMultiplier',
      sizes.fixedHeightFontScale,
    );
    expect(input()).toHaveStyle({ fontFamily: 'Montserrat-Medium' });
  });

  it('em repouso e vazio, o rótulo fica no meio e sem camada de foco', async () => {
    await renderField();

    expect(style('campo-label')).toMatchObject({
      transform: [{ translateY: 0 }, { scale: 1 }],
      transformOrigin: 'left center',
    });
    expect(style('campo-label-active').opacity).toBe(0);
    expect(style('campo-focus-layer').opacity).toBe(0);
    expect(style('campo-error-layer').opacity).toBe(0);
  });

  it('com foco o rótulo sobe e encolhe, fica teal, e a camada de foco acende com brilho', async () => {
    await renderField();

    await fireEvent(input(), 'focus');

    expect(style('campo-label').transform).toEqual([
      { translateY: raisedY },
      { scale: motion.fieldLabelScale },
    ]);
    expect(style('campo-label-active').opacity).toBe(1);
    expect(style('campo-focus-layer')).toMatchObject({
      opacity: 1,
      borderColor: colors.primary,
      borderWidth: sizes.textFieldFocusBorder,
      borderRadius: borderRadii.m,
      boxShadow: [shadows.glowPrimary],
    });

    await fireEvent(input(), 'blur');
    expect(style('campo-focus-layer').opacity).toBe(0);
  });

  it('com valor e sem foco o rótulo continua em cima, na cor de repouso', async () => {
    await renderField({ value: '969' });

    expect(style('campo-label').transform).toEqual([
      { translateY: raisedY },
      { scale: motion.fieldLabelScale },
    ]);
    expect(style('campo-label-active').opacity).toBe(0);
  });

  it('repassa onFocus e onBlur', async () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    await renderField({ onFocus, onBlur });

    await fireEvent(input(), 'focus');
    await fireEvent(input(), 'blur');

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('erro: camada danger (vence o foco), texto embaixo e o erro vira a dica do campo', async () => {
    await renderField({ error: 'Confira o CPF digitado.' });
    await fireEvent(input(), 'focus');

    expect(style('campo-error-layer')).toMatchObject({
      opacity: 1,
      borderColor: colors.danger,
    });
    expect(style('campo-focus-layer').opacity).toBe(0);
    expect(screen.getByTestId('campo-error')).toHaveTextContent(
      'Confira o CPF digitado.',
    );
    expect(input()).toHaveProp('accessibilityHint', 'Confira o CPF digitado.');
  });

  it('o erro é anunciado uma vez ao leitor de tela quando aparece', async () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announce.mockClear();
    const view = await renderField();
    expect(announce).not.toHaveBeenCalled();

    await view.rerender(
      <TextField
        testID="campo"
        label="CPF"
        icon={() => null}
        value=""
        onChangeText={jest.fn()}
        error="Confira o CPF digitado."
      />,
    );

    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith('Confira o CPF digitado.');
    announce.mockRestore();
  });

  it('sem erro, a dica é a que veio por prop', async () => {
    await renderField({ accessibilityHint: 'Somente números' });

    expect(input()).toHaveProp('accessibilityHint', 'Somente números');
    expect(screen.queryByTestId('campo-error')).toBeNull();
  });

  it('o erro entra por valor animado (sem layout animation); com reduzir movimento sem deslocamento', async () => {
    reducedMotionMock.mockReturnValue(true);
    await renderField({ error: 'Erro' });

    // Layout animation podia deixar a view montada e invisível no Android.
    expect(entering('campo-error-enter')).toBeUndefined();
    expect(style('campo-error-enter')).toMatchObject({
      transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }],
    });
  });

  describe('máscara de CPF', () => {
    it('teclado numérico, 14 caracteres e autofill de usuário', async () => {
      await renderField({ mask: 'cpf' });

      expect(input()).toHaveProp('keyboardType', 'number-pad');
      expect(input()).toHaveProp('maxLength', 14);
      expect(input()).toHaveProp('textContentType', 'username');
      expect(input()).toHaveProp('autoComplete', 'username');
    });

    it('aplica a máscara enquanto digita', async () => {
      const onChangeText = jest.fn();
      await renderField({ mask: 'cpf', onChangeText });

      await fireEvent.changeText(input(), '9692945');

      expect(onChangeText).toHaveBeenCalledWith('969.294.5');
    });
  });

  it('o placeholder só aparece com foco e vazio', async () => {
    const view = await renderField({
      placeholderWhenFocused: '000.000.000-00',
    });

    expect(input().props.placeholder).toBeUndefined();
    await fireEvent(input(), 'focus');
    expect(input()).toHaveProp('placeholder', '000.000.000-00');
    expect(input()).toHaveProp('placeholderTextColor', colors.textTertiary);

    await view.rerender(
      <TextField
        testID="campo"
        label="CPF"
        icon={() => null}
        value="9"
        onChangeText={jest.fn()}
        placeholderWhenFocused="000.000.000-00"
      />,
    );
    expect(input().props.placeholder).toBeUndefined();
  });

  describe('senha (secureToggle)', () => {
    const toggle = () => screen.getByTestId('campo-toggle');

    it('começa oculta, com o botão "Mostrar senha" de 44 × 44', async () => {
      await renderField({ label: 'Senha', secureToggle: true });

      expect(input()).toHaveProp('secureTextEntry', true);
      expect(toggle()).toHaveProp('accessibilityRole', 'button');
      expect(toggle()).toHaveAccessibleName('Mostrar senha');
      expect(toggle()).toHaveStyle({
        width: sizes.touchTarget,
        height: sizes.touchTarget,
      });
    });

    it('o toque alterna o modo e o rótulo, com crossfade e escala no ícone que entra', async () => {
      await renderField({ label: 'Senha', secureToggle: true });
      expect(style('campo-toggle-show')).toMatchObject({
        opacity: 1,
        transform: [{ scale: 1 }],
      });
      expect(style('campo-toggle-hide')).toMatchObject({
        opacity: 0,
        transform: [{ scale: motion.toggleIconFrom }],
      });

      await fireEvent.press(toggle());

      expect(input()).toHaveProp('secureTextEntry', false);
      expect(toggle()).toHaveAccessibleName('Ocultar senha');
      expect(style('campo-toggle-show').opacity).toBe(0);
      expect(style('campo-toggle-hide')).toMatchObject({
        opacity: 1,
        transform: [{ scale: 1 }],
      });

      await fireEvent.press(toggle());
      expect(input()).toHaveProp('secureTextEntry', true);
    });

    it('com reduzir movimento os ícones só fazem crossfade, sem escala', async () => {
      reducedMotionMock.mockReturnValue(true);
      await renderField({ label: 'Senha', secureToggle: true });

      expect(style('campo-toggle-hide').transform).toEqual([{ scale: 1 }]);
    });

    it('campo sem secureToggle não tem botão', async () => {
      await renderField();

      expect(screen.queryByTestId('campo-toggle')).toBeNull();
      expect(input().props.secureTextEntry).toBeFalsy();
    });
  });

  it('desabilitado (envio): não editável e a 0,6', async () => {
    await renderField({ editable: false });

    expect(input()).toHaveProp('editable', false);
    expect(style('campo-container').opacity).toBe(opacities.busy);
  });

  it('o inputRef chega no TextInput', async () => {
    const ref = createRef<TextInputInstance>();
    await renderField({ inputRef: ref });

    expect(ref.current).not.toBeNull();
  });

  it('repassa returnKeyType e onSubmitEditing', async () => {
    const onSubmitEditing = jest.fn();
    await renderField({ returnKeyType: 'go', onSubmitEditing });

    expect(input()).toHaveProp('returnKeyType', 'go');
    await fireEvent(input(), 'submitEditing');
    expect(onSubmitEditing).toHaveBeenCalled();
  });
});

import { act, fireEvent, screen, within } from '@testing-library/react-native';
import { AccessibilityInfo, Dimensions, Platform } from 'react-native';
import * as Reanimated from 'react-native-reanimated';

import { mockMeasureInWindow } from '../../test/measureInWindow';
import { renderWithTheme } from '../../test/renderWithTheme';
import { theme } from '../../theme';
import { Dropdown } from '../Dropdown';

const options = [
  { key: '2025-03-16', label: '16 de março, domingo' },
  { key: '2025-03-17', label: '17 de março, segunda-feira' },
  { key: '2025-03-18', label: '18 de março, terça-feira' },
];

/** Posição do gatilho na janela (o `measureInWindow` do Jest não responde). */
const TRIGGER = { x: 24, y: 300, width: 366, height: 45 };

const measureAt = (y: number) => mockMeasureInWindow({ ...TRIGGER, y });

const NO_INSETS = { top: 0, bottom: 0, left: 0, right: 0 };
let mockInsets = NO_INSETS;
jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context/jest/mock').default,
  useSafeAreaInsets: () => mockInsets,
}));

const WEEK = [
  '16 de março, domingo',
  '17 de março, segunda-feira',
  '18 de março, terça-feira',
  '19 de março, quarta-feira',
  '20 de março, quinta-feira',
  '21 de março, sexta-feira',
  '22 de março, sábado',
].map((label, i) => ({ key: `2025-03-${16 + i}`, label }));

describe('Dropdown', () => {
  const onSelect = jest.fn();

  beforeEach(() => {
    onSelect.mockClear();
    (AccessibilityInfo.sendAccessibilityEvent as jest.Mock).mockClear();
    measureAt(TRIGGER.y);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockInsets = NO_INSETS;
  });

  const renderDropdown = () =>
    renderWithTheme(
      <Dropdown
        testID="agenda-day-dropdown"
        label="18 de março, terça-feira"
        options={options}
        selectedKey="2025-03-18"
        onSelect={onSelect}
        accessibilityLabelPrefix="Dia"
        accessibilityHint="Toque para escolher outro dia"
        marginHorizontal="l"
      />,
    );

  const open = () => fireEvent.press(screen.getByTestId('agenda-day-dropdown'));

  it('fechado: mostra o rótulo e anuncia o valor, recolhido', async () => {
    await renderDropdown();

    const trigger = screen.getByTestId('agenda-day-dropdown');
    expect(screen.getByTestId('agenda-day-dropdown-label')).toHaveTextContent(
      '18 de março, terça-feira',
    );
    expect(trigger).toHaveAccessibleName('Dia: 18 de março, terça-feira');
    expect(trigger).toHaveProp('accessibilityRole', 'button');
    expect(trigger).toHaveProp(
      'accessibilityHint',
      'Toque para escolher outro dia',
    );
    expect(trigger).not.toBeExpanded();
    expect(
      screen.queryByTestId('agenda-day-dropdown-option-2025-03-16'),
    ).toBeNull();
  });

  it('tocar no gatilho abre a lista, expandida, com a opção atual selecionada', async () => {
    await renderDropdown();

    await open();

    expect(screen.getByTestId('agenda-day-dropdown')).toBeExpanded();
    for (const option of options) {
      const row = screen.getByTestId(
        `agenda-day-dropdown-option-${option.key}`,
      );
      expect(row).toHaveTextContent(option.label);
      expect(row).toHaveProp('accessibilityRole', 'button');
    }
    expect(
      screen.getByTestId('agenda-day-dropdown-option-2025-03-18'),
    ).toBeSelected();
    expect(
      screen.getByTestId('agenda-day-dropdown-option-2025-03-16'),
    ).not.toBeSelected();
  });

  it('a lista fica s abaixo do gatilho, com a mesma largura e o mesmo x', async () => {
    await renderDropdown();

    await open();

    expect(screen.getByTestId('agenda-day-dropdown-options')).toHaveStyle({
      position: 'absolute',
      left: TRIGGER.x,
      width: TRIGGER.width,
      top: TRIGGER.y + TRIGGER.height + theme.spacing.s,
    });
  });

  it('sem espaço abaixo do gatilho, a lista abre acima', async () => {
    const windowHeight = Dimensions.get('window').height;
    const nearBottom = windowHeight - TRIGGER.height - theme.spacing.m;
    measureAt(nearBottom);
    await renderDropdown();

    await open();

    expect(screen.getByTestId('agenda-day-dropdown-options')).toHaveStyle({
      bottom: windowHeight - nearBottom + theme.spacing.s,
    });
  });

  it('cada opção tem alvo de toque ≥ 44 na própria área de toque', async () => {
    await renderDropdown();

    await open();

    expect(
      screen.getByTestId('agenda-day-dropdown-option-2025-03-16'),
    ).toHaveStyle({ minHeight: theme.sizes.touchTarget });
  });

  it('escolher uma opção chama onSelect e fecha', async () => {
    await renderDropdown();
    await open();

    await fireEvent.press(
      screen.getByTestId('agenda-day-dropdown-option-2025-03-17'),
    );

    expect(onSelect).toHaveBeenCalledWith('2025-03-17');
    expect(
      screen.queryByTestId('agenda-day-dropdown-option-2025-03-17'),
    ).toBeNull();
    expect(screen.getByTestId('agenda-day-dropdown')).not.toBeExpanded();
  });

  it('tocar fora da lista fecha sem mudar nada', async () => {
    await renderDropdown();
    await open();

    await fireEvent.press(screen.getByTestId('agenda-day-dropdown-backdrop'));

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByTestId('agenda-day-dropdown-options')).toBeNull();
  });

  it('o voltar do Android fecha sem mudar nada', async () => {
    await renderDropdown();
    await open();

    await fireEvent(
      screen.getByTestId('agenda-day-dropdown-modal'),
      'requestClose',
    );

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByTestId('agenda-day-dropdown-options')).toBeNull();
  });

  it('com uma opção só, funciona igual', async () => {
    await renderWithTheme(
      <Dropdown
        testID="boletim-year-dropdown"
        label="1EF - 2025"
        options={[{ key: '2025', label: '1EF - 2025' }]}
        selectedKey="2025"
        onSelect={onSelect}
        accessibilityLabelPrefix="Turma e ano"
        accessibilityHint="Toque para ver outros anos"
        marginHorizontal="m"
      />,
    );

    await fireEvent.press(screen.getByTestId('boletim-year-dropdown'));
    await fireEvent.press(
      screen.getByTestId('boletim-year-dropdown-option-2025'),
    );

    expect(onSelect).toHaveBeenCalledWith('2025');
  });

  describe('Android 360 × 640 com o gatilho em y ≈ 290 (achado da revisão)', () => {
    const original = Dimensions.get('window');

    beforeEach(() => {
      // Antes do render: nada montado ainda.
      Dimensions.set({ window: { ...original, width: 360, height: 640 } });
      mockInsets = { top: 24, bottom: 16, left: 0, right: 0 };
      measureAt(290);
    });

    afterEach(async () => {
      // A tela ainda está montada aqui (o cleanup vem depois).
      await act(() => Dimensions.set({ window: original }));
    });

    it('as 7 opções ficam alcançáveis: lista dentro da área segura e rolável', async () => {
      await renderWithTheme(
        <Dropdown
          testID="agenda-day-dropdown"
          label="18 de março, terça-feira"
          options={WEEK}
          selectedKey="2025-03-18"
          onSelect={onSelect}
          accessibilityLabelPrefix="Dia"
          accessibilityHint="Toque para escolher outro dia"
          marginHorizontal="l"
        />,
      );

      await open();

      // 7 × 44 + 8 = 316 não cabe nem abaixo (281) nem acima (258): abre no
      // lado maior, limitada a ele, e rola.
      const list = screen.getByTestId('agenda-day-dropdown-options');
      const top = 290 + TRIGGER.height + theme.spacing.s;
      const maxHeight = 640 - 16 - top;
      expect(list).toHaveStyle({ top, maxHeight });
      expect(top).toBeGreaterThanOrEqual(24);

      const scroll = screen.getByTestId('agenda-day-dropdown-scroll');
      for (const option of WEEK) {
        expect(
          within(scroll).getByTestId(
            `agenda-day-dropdown-option-${option.key}`,
          ),
        ).toBeOnTheScreen();
      }
    });

    it('abrindo acima, o topo da lista não passa da área segura', async () => {
      measureAt(560);
      await renderWithTheme(
        <Dropdown
          testID="agenda-day-dropdown"
          label="18 de março, terça-feira"
          options={WEEK}
          selectedKey="2025-03-18"
          onSelect={onSelect}
          accessibilityLabelPrefix="Dia"
          accessibilityHint="Toque para escolher outro dia"
          marginHorizontal="l"
        />,
      );

      await open();

      expect(screen.getByTestId('agenda-day-dropdown-options')).toHaveStyle({
        bottom: 640 - 560 + theme.spacing.s,
        maxHeight: 560 - theme.spacing.s - 24,
      });
    });
  });

  it('texto da opção com o teto de fonte grande, como o gatilho', async () => {
    await renderDropdown();
    await open();

    expect(
      within(
        screen.getByTestId('agenda-day-dropdown-option-2025-03-16'),
      ).getByText('16 de março, domingo'),
    ).toHaveProp('maxFontSizeMultiplier', theme.sizes.fixedHeightFontScale);
  });

  it('iOS: o foco volta ao gatilho só no onDismiss do Modal', async () => {
    await renderDropdown();
    await open();
    const { onDismiss } = screen.getByTestId('agenda-day-dropdown-modal').props;

    await fireEvent.press(
      screen.getByTestId('agenda-day-dropdown-option-2025-03-17'),
    );
    expect(AccessibilityInfo.sendAccessibilityEvent).not.toHaveBeenCalled();

    await act(() => onDismiss());
    expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenCalledWith(
      expect.anything(),
      'focus',
    );
  });

  it('Android: o foco volta ao gatilho depois do commit que tira o Modal', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    await renderDropdown();
    await open();

    await fireEvent.press(
      screen.getByTestId('agenda-day-dropdown-option-2025-03-17'),
    );

    expect(screen.queryByTestId('agenda-day-dropdown-options')).toBeNull();
    expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenCalledWith(
      expect.anything(),
      'focus',
    );
  });

  it('durante a saída da lista, as opções não recebem toque', async () => {
    // Saída que não termina: a lista continua montada, sumindo.
    jest
      .spyOn(Reanimated, 'withTiming')
      .mockImplementation(((value: number) => value) as never);
    await renderDropdown();
    await open();

    await fireEvent.press(
      screen.getByTestId('agenda-day-dropdown-option-2025-03-17'),
    );
    await fireEvent.press(
      screen.getByTestId('agenda-day-dropdown-option-2025-03-16'),
    );

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('2025-03-17');
    expect(screen.getByTestId('agenda-day-dropdown-options')).toHaveProp(
      'pointerEvents',
      'none',
    );
  });
});

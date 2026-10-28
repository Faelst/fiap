import { fireEvent, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Dimensions } from 'react-native';

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

describe('Dropdown', () => {
  const onSelect = jest.fn();

  beforeEach(() => {
    onSelect.mockClear();
    (AccessibilityInfo.sendAccessibilityEvent as jest.Mock).mockClear();
    measureAt(TRIGGER.y);
  });

  afterEach(() => jest.restoreAllMocks());

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

  it('escolher uma opção chama onSelect, fecha e devolve o foco ao gatilho', async () => {
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
    expect(AccessibilityInfo.sendAccessibilityEvent).toHaveBeenCalledWith(
      expect.anything(),
      'focus',
    );
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
});

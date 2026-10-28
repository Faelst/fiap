import { screen } from '@testing-library/react-native';
import type { ComponentType } from 'react';
import type { JsonElement } from 'test-renderer';

import { renderWithTheme } from '../../../test/renderWithTheme';
import { theme } from '../../../theme';
import { AlertIcon } from '../AlertIcon';
import { CalendarOffIcon } from '../CalendarOffIcon';
import { CheckIcon } from '../CheckIcon';
import { ChevronRightIcon } from '../ChevronRightIcon';
import { ClockIcon } from '../ClockIcon';
import { EyeIcon } from '../EyeIcon';
import { EyeOffIcon } from '../EyeOffIcon';
import { IdCardIcon } from '../IdCardIcon';
import { LockIcon } from '../LockIcon';
import { ProfileIcon } from '../ProfileIcon';
import { RefreshIcon } from '../RefreshIcon';
import type { IconProps } from '../StrokeIcon';
import { UsersIcon } from '../UsersIcon';
import { WifiOffIcon } from '../WifiOffIcon';

const icons: [string, ComponentType<IconProps>][] = [
  ['ProfileIcon', ProfileIcon],
  ['LockIcon', LockIcon],
  ['IdCardIcon', IdCardIcon],
  ['EyeIcon', EyeIcon],
  ['EyeOffIcon', EyeOffIcon],
  ['AlertIcon', AlertIcon],
  ['WifiOffIcon', WifiOffIcon],
  ['ClockIcon', ClockIcon],
  ['CalendarOffIcon', CalendarOffIcon],
  ['UsersIcon', UsersIcon],
  ['RefreshIcon', RefreshIcon],
  ['CheckIcon', CheckIcon],
  ['ChevronRightIcon', ChevronRightIcon],
];

const svgRoot = () => screen.toJSON() as JsonElement;

/** Nós do tipo pedido, em qualquer profundidade. */
function nodesOf(node: JsonElement, type: string): JsonElement[] {
  const children = (node.children ?? []).filter(
    (child: JsonElement | string): child is JsonElement =>
      typeof child !== 'string',
  );
  const found: JsonElement[] = node.type === type ? [node] : [];
  return found.concat(
    ...children.map((child: JsonElement): JsonElement[] =>
      nodesOf(child, type),
    ),
  );
}

describe('ícones de traço (01-design.md da v2, 2.1)', () => {
  it.each(icons)(
    '%s: traço na cor pedida, 1,9, pontas redondas, sem preenchimento e 20 por padrão',
    async (_name, Icon) => {
      await renderWithTheme(<Icon color="#29F4D5" />);

      expect(svgRoot().props).toMatchObject({
        width: theme.sizes.iconSmall,
        height: theme.sizes.iconSmall,
        vbWidth: 24,
        vbHeight: 24,
        stroke: '#29F4D5',
        strokeWidth: theme.sizes.iconStroke,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        fill: 'none',
      });
    },
  );

  it.each(icons)('%s: aceita outro tamanho', async (_name, Icon) => {
    await renderWithTheme(<Icon color="#FFFFFF" size={28} />);

    expect(svgRoot().props).toMatchObject({ width: 28, height: 28 });
  });

  it.each([
    ['AlertIcon', AlertIcon],
    ['WifiOffIcon', WifiOffIcon],
  ] as const)('%s: o ponto é preenchido na cor do ícone', async (_n, Icon) => {
    await renderWithTheme(<Icon color="#FF5C8D" />);

    // Só o ponto define `fill` (os outros herdam o `none` do Svg).
    const filled = nodesOf(svgRoot(), 'RNSVGCircle').filter(circle =>
      (circle.props.propList ?? []).includes('fill'),
    );
    expect(filled).toHaveLength(1);
  });

  it('o EyeOffIcon é o olho com a barra diagonal', async () => {
    await renderWithTheme(<EyeIcon color="#FFFFFF" />);
    const eyePaths = nodesOf(svgRoot(), 'RNSVGPath').length;
    await renderWithTheme(<EyeOffIcon color="#FFFFFF" />);

    expect(nodesOf(svgRoot(), 'RNSVGPath')).toHaveLength(eyePaths + 1);
  });
});

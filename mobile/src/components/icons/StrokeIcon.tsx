import type { ReactNode } from 'react';
import Svg from 'react-native-svg';

import { useTheme } from '../../theme';

export type IconProps = {
  color: string;
  /** Padrão `sizes.iconSmall` (20). */
  size?: number;
};

/**
 * Base dos ícones de traço da v2 (01-design.md da v2, 2.1): viewBox 24,
 * traço `sizes.iconStroke` na cor do ícone, pontas e junções redondas, sem
 * preenchimento. Decorativo: quem tem rótulo é o pai.
 */
export function StrokeIcon({
  color,
  size,
  children,
}: IconProps & { children: ReactNode }) {
  const { sizes } = useTheme();
  const side = size ?? sizes.iconSmall;
  return (
    <Svg
      width={side}
      height={side}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sizes.iconStroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
    >
      {children}
    </Svg>
  );
}

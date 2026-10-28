import { Circle, Path } from 'react-native-svg';

import { StrokeIcon, type IconProps } from './StrokeIcon';

/** Ocultar senha: o olho com uma barra diagonal. */
export function EyeOffIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <Circle cx={12} cy={12} r={3} />
      <Path d="M4 4l16 16" />
    </StrokeIcon>
  );
}

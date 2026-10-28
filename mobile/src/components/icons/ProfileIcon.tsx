import { Circle, Path } from 'react-native-svg';

import { StrokeIcon, type IconProps } from './StrokeIcon';

/** Aba Perfil: cabeça e ombros. */
export function ProfileIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <Circle cx={12} cy={8} r={4} />
      <Path d="M4.5 21c.7-3.9 3.7-6.5 7.5-6.5s6.8 2.6 7.5 6.5" />
    </StrokeIcon>
  );
}

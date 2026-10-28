import { Circle, Path } from 'react-native-svg';

import { StrokeIcon, type IconProps } from './StrokeIcon';

/** Erros: círculo com exclamação (o ponto é preenchido). */
export function AlertIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 7.5v5.5" />
      <Circle cx={12} cy={16.5} r={1} fill={props.color} stroke="none" />
    </StrokeIcon>
  );
}

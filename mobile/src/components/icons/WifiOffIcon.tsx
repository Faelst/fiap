import { Circle, Path } from 'react-native-svg';

import { StrokeIcon, type IconProps } from './StrokeIcon';

/** BootError: sinal de wi-fi cortado (o ponto é preenchido). */
export function WifiOffIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <Path d="M2 9a14.5 14.5 0 0 1 20 0" />
      <Path d="M5 12.5a10 10 0 0 1 14 0" />
      <Path d="M8.5 16a5 5 0 0 1 7 0" />
      <Circle cx={12} cy={19.5} r={1.2} fill={props.color} stroke="none" />
      <Path d="M3.5 3.5l17 17" />
    </StrokeIcon>
  );
}

import { Circle, Path, Rect } from 'react-native-svg';

import { StrokeIcon, type IconProps } from './StrokeIcon';

/** Campo CPF: documento com foto. */
export function IdCardIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <Rect x={3} y={5} width={18} height={14} rx={2.5} />
      <Circle cx={9} cy={11} r={2} />
      <Path d="M6 16c.5-1.4 1.6-2.1 3-2.1s2.5.7 3 2.1" />
      <Path d="M14.5 10h4" />
      <Path d="M14.5 13.5h3" />
    </StrokeIcon>
  );
}

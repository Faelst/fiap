import { Circle, Path } from 'react-native-svg';

import { StrokeIcon, type IconProps } from './StrokeIcon';

/** Sem aluno: duas pessoas. */
export function UsersIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <Circle cx={9} cy={8} r={3.5} />
      <Path d="M2.5 20c.5-3.6 3.2-6 6.5-6s6 2.4 6.5 6" />
      <Path d="M16 4.8a3.5 3.5 0 0 1 0 6.4" />
      <Path d="M18 14.3c2 .8 3.2 2.9 3.5 5.7" />
    </StrokeIcon>
  );
}

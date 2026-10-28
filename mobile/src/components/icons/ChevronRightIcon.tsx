import { Path } from 'react-native-svg';

import { StrokeIcon, type IconProps } from './StrokeIcon';

/** Chip do aluno: seta para a direita. */
export function ChevronRightIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <Path d="M9.5 6l6 6-6 6" />
    </StrokeIcon>
  );
}

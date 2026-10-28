import { Path, Rect } from 'react-native-svg';

import { StrokeIcon, type IconProps } from './StrokeIcon';

/** Campo Senha: cadeado. */
export function LockIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <Rect x={5} y={10.5} width={14} height={10} rx={2.5} />
      <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </StrokeIcon>
  );
}

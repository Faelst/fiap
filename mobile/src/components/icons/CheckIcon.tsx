import { Path } from 'react-native-svg';

import { StrokeIcon, type IconProps } from './StrokeIcon';

/** Selo "Atual": visto. */
export function CheckIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <Path d="M5 12.5l4.5 4.5L19 7.5" />
    </StrokeIcon>
  );
}

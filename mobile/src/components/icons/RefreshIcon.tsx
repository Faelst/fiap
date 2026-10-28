import { Path } from 'react-native-svg';

import { StrokeIcon, type IconProps } from './StrokeIcon';

/** "Tentar de novo": seta circular. */
export function RefreshIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <Path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <Path d="M20 4.5V9h-4.5" />
    </StrokeIcon>
  );
}

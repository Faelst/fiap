import { Path, Rect } from 'react-native-svg';

import { StrokeIcon, type IconProps } from './StrokeIcon';

/** Dia sem aulas: calendário com um X. */
export function CalendarOffIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <Rect x={3.5} y={5} width={17} height={15.5} rx={2.5} />
      <Path d="M3.5 9.5h17" />
      <Path d="M8 3v4" />
      <Path d="M16 3v4" />
      <Path d="M9.5 13.5l5 5" />
      <Path d="M14.5 13.5l-5 5" />
    </StrokeIcon>
  );
}

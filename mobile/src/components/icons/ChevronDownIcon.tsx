import Svg, { Path } from 'react-native-svg';

type IconProps = { color: string; size: number };

/** Chevron dos dropdowns e acordeões (.docs/figma/assets/chevron-down.svg), 14 × 14. */
export function ChevronDownIcon({ color, size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path
        d="M13.8136 3.36819C13.5652 3.11971 13.1622 3.11967 12.9137 3.36823L7.00017 9.28187L1.08636 3.36819C0.837879 3.11971 0.434933 3.11967 0.186412 3.36823C-0.0621093 3.61675 -0.0621093 4.01965 0.186412 4.26818L6.55022 10.6318C6.66956 10.7512 6.83141 10.8182 7.00017 10.8182C7.16893 10.8182 7.33082 10.7511 7.45012 10.6318L13.8136 4.26813C14.0622 4.01965 14.0622 3.61671 13.8136 3.36819Z"
        fill={color}
      />
    </Svg>
  );
}

import { Box, type BoxProps } from '../theme';

type SkeletonProps = Omit<BoxProps, 'backgroundColor' | 'borderRadius'> & {
  radius?: 'm' | 'round';
};

/**
 * Bloco do skeleton (01-design.md, 2.13), em `surface`. Não anima sozinho: o
 * grupo inteiro pulsa junto com `useSkeletonPulse`.
 */
export function Skeleton({ radius = 'm', ...props }: SkeletonProps) {
  return <Box backgroundColor="surface" borderRadius={radius} {...props} />;
}

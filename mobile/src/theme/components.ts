import {
  createBox,
  createRestyleComponent,
  createText,
  createVariant,
  type VariantProps,
} from '@shopify/restyle';
import type { ComponentProps } from 'react';

import type { Theme } from './theme';

export const Box = createBox<Theme>();
export const Text = createText<Theme>();

export type BoxProps = ComponentProps<typeof Box>;
export type TextProps = ComponentProps<typeof Text>;

export type CardProps = VariantProps<Theme, 'cardVariants'> & BoxProps;

/** Box com as `cardVariants` do tema (dropdown, options, term, student...). */
export const Card = createRestyleComponent<CardProps, Theme>(
  [createVariant({ themeKey: 'cardVariants' })],
  Box,
);

import type { ValuesType } from 'utility-types'

/**
 * Standard size variants for UI components.
 * Used across buttons, inputs, and other elements for consistent sizing.
 */
export const Size = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
} as const

export type Size = ValuesType<typeof Size>

/**
 * Size variants specifically for headline components.
 * Provides more granular control with additional extra-large options.
 */
export const HeadlineSize = {
  '3XL': '3xl',
  '2XL': '2xl',
  XL: 'xl',
  LG: 'lg',
  MD: 'md',
  SM: 'sm',
} as const

export type HeadlineSize = ValuesType<typeof HeadlineSize>

/**
 * Semantic HTML tags available for headline components.
 * Supports heading hierarchy (h1-h6) and alternative display elements.
 */
export const HeadlineTag = {
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  H4: 'h4',
  H5: 'h5',
  H6: 'h6',
  P: 'p',
  DIV: 'div',
  SPAN: 'span',
} as const

export type HeadlineTag = ValuesType<typeof HeadlineTag>

/**
 * Predefined skeleton loader types for common UI patterns.
 */
export const SkeletonType = {
  BUTTON: 'button',
  HEADLINE: 'headline',
  CUSTOM: 'custom',
} as const

export type SkeletonType = ValuesType<typeof SkeletonType>

/**
 * Visual variants for link components, controlling prominence and styling.
 */
export const LinkVariant = {
  LOUD: 'loud',
  NORMAL: 'normal',
  WHISPER: 'whisper',
  QUIET: 'quiet',
} as const

export type LinkVariant = ValuesType<typeof LinkVariant>

/**
 * Button style variants defining visual hierarchy and purpose.
 */
export const ButtonVariant = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  TERTIARY: 'tertiary',
  RAW: 'raw',
  ACCENT: 'accent',
  SLIDER: 'slider',
} as const

export type ButtonVariant = ValuesType<typeof ButtonVariant>

/**
 * Component tags that can be used with divider functionality.
 */
export const DividerItemTag = {
  LINK: 'SFLink',
  NUXT_LINK: 'NuxtLink',
  PARAGRAPH: 'p',
} as const

export type DividerItemTag = ValuesType<typeof DividerItemTag>

/**
 * Status types for progress indicators and notifications.
 */
export const ProgressType = {
  SUCCESS: 'success',
  WARN: 'warn',
  DANGER: 'danger',
  NEUTRAL: 'neutral',
} as const

export type ProgressType = ValuesType<typeof ProgressType>

/**
 * Border radius variants for color chip components.
 */
export const ColorChipRoundedType = {
  DEFAULT: 'default',
  SM: 'sm',
  MD: 'md',
} as const

export type ColorChipRoundedType = ValuesType<typeof ColorChipRoundedType>

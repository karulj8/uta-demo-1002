/**
 * Default aspect ratio for product images [width, height].
 * Used to maintain consistent image dimensions across the Storefront Application.
 *
 * @example [3, 4] represents a 3:4 aspect ratio (portrait orientation)
 */
export const PRODUCT_IMAGE_ASPECT_RATIO = [3, 4]

/**
 * Responsive breakpoint values in pixels.
 * These breakpoints define the screen widths at which responsive layouts change.
 * Values should match the breakpoints defined in `tailwind.config.ts` for consistency.
 */
export const BREAKPOINTS = {
  /** Extra small devices (mobile phones, 320px and up) */
  xs: 320,
  /** Small devices (larger phones, 640px and up) */
  sm: 640,
  /** Medium devices (tablets, 768px and up) */
  md: 768,
  /** Large devices (desktops, 1024px and up) */
  lg: 1024,
  /** Extra large devices (large desktops, 1280px and up) */
  xl: 1280,
}

import type { Value } from '@scayle/storefront-nuxt'

/**
 * Formats color attribute values into a human-readable string.
 * Used for product descriptions, alt text, and sibling pickers.
 *
 * **Format patterns:**
 * - Single color: `"Red"`
 * - Two colors: `"Red & Blue"`
 * - Multiple colors: `"Red, Green & Blue"`
 *
 * @param colors - Array of color attribute values
 * @returns Formatted color string or empty string if no colors
 *
 * @example
 * ```ts
 * formatColors([{ label: 'Red' }]) // "Red"
 * formatColors([{ label: 'Red' }, { label: 'Blue' }]) // "Red & Blue"
 * formatColors([{ label: 'Red' }, { label: 'Green' }, { label: 'Blue' }]) // "Red, Green & Blue"
 * formatColors([]) // ""
 * ```
 */
export const formatColors = (colors: Value[] = []): string => {
  if (!colors.length) {
    return ''
  }
  const colorLabels = colors.map((color) => color.label)
  if (colorLabels.length === 1) {
    return colorLabels[0] as string
  }
  const lastColorLabel = colorLabels.at(-1)
  const restColorLabels = colorLabels.slice(0, -1)
  return `${restColorLabels.join(', ')} & ${lastColorLabel}`
}

/**
 * Determines if a divider should be shown between array items.
 * Returns `true` for all items except the last one, when the array has more than one item.
 *
 * @param index - The current item index (zero-based)
 * @param arrayLength - The total length of the array
 * @returns `true` if divider should be shown after this item, `false` otherwise
 *
 * @example
 * ```ts
 * showDividerTag(0, 3) // true  - Show divider after first item
 * showDividerTag(1, 3) // true  - Show divider after second item
 * showDividerTag(2, 3) // false - Don't show divider after last item
 * showDividerTag(0, 1) // false - Don't show divider when only one item
 * ```
 */
export const showDividerTag = (index: number, arrayLength: number): boolean => {
  return index >= 0 && arrayLength > 1 && index < arrayLength - 1
}

/**
 * Gets the number of decimal places a currency uses in its standard representation
 * using the Internationalization API.
 *
 * @param currencyCode - The ISO-4217 currency code (e.g., `'USD'`, `'EUR'`, `'JPY'`)
 * @returns The number of decimal places (e.g., `2` for USD, `0` for JPY)
 *
 * @example
 * ```ts
 * getDecimalPlacesForCurrency('USD') // 2
 * getDecimalPlacesForCurrency('JPY') // 0
 * getDecimalPlacesForCurrency('BHD') // 3
 * ```
 */
export function getDecimalPlacesForCurrency(currencyCode: string): number {
  const parts = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).formatToParts(0)

  const fraction = parts.find((p) => p.type === 'fraction')

  if (!fraction) {
    return 0
  }

  return fraction.value.length
}

/**
 * Rounds a number down to the nearest interval using `Math.floor`.
 *
 * @param value - The number to round down
 * @param interval - The interval to round to (must be non-zero)
 * @returns The rounded number, or `NaN` if interval is invalid
 *
 * @example
 * ```ts
 * roundDown(17, 5)   // 15
 * roundDown(42, 10)  // 40
 * roundDown(7.8, 2)  // 6
 * roundDown(10, 0)   // NaN
 * ```
 */
export function roundDown(value: number, interval: number): number {
  if (isNaN(interval) || !interval) {
    return NaN
  }
  const div = value / interval
  return Math.floor(div) * interval
}

/**
 * Rounds a number up to the nearest interval using `Math.ceil`.
 *
 * @param value - The number to round up
 * @param interval - The interval to round to (must be non-zero)
 * @returns The rounded number, or `NaN` if interval is invalid
 *
 * @example
 * ```ts
 * roundUp(17, 5)   // 20
 * roundUp(42, 10)  // 50
 * roundUp(7.8, 2)  // 8
 * roundUp(10, 0)   // NaN
 * ```
 */
export function roundUp(value: number, interval: number): number {
  if (isNaN(interval) || !interval) {
    return NaN
  }
  const div = value / interval
  return Math.ceil(div) * interval
}

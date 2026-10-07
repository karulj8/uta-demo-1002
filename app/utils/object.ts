/**
 * Creates a deep copy using JSON serialization.
 * Simple and fast for JSON-serializable data.
 *
 * **Limitations:**
 * - Cannot clone functions, symbols, or undefined values
 * - Loses Date objects (converted to strings)
 * - Cannot handle circular references
 *
 * @template T - Type of the data being cloned (preserves type information)
 *
 * @param data - Data to clone
 *
 * @returns Deep copy of the input data
 *
 * @example
 * ```ts
 * const original = { name: 'John', items: [1, 2, 3] }
 * const copy = deepClone(original)
 * copy.items.push(4) // Original unchanged
 * ```
 */
export const deepClone = <T>(data: T): T => JSON.parse(JSON.stringify(data))

/**
 * Performs deep equality comparison between two values.
 * Used for change detection in basket, wishlist, and user state.
 *
 * **Supports:**
 * - Primitives (string, number, boolean, etc.)
 * - Date objects (compares timestamps)
 * - RegExp objects (compares string representations)
 * - Objects and arrays (recursive deep comparison)
 * - Null and undefined
 *
 * @template T - Type of values being compared (both values must have the same type)
 *
 * @param x - First value to compare
 * @param y - Second value to compare
 *
 * @returns `true` if values are deeply equal, `false` otherwise
 *
 * @example
 * ```ts
 * isEqual({ a: 1, b: 2 }, { a: 1, b: 2 }) // true
 * isEqual([1, 2, 3], [1, 2, 3]) // true
 * isEqual(new Date('2024-01-01'), new Date('2024-01-01')) // true
 *
 * // Used in tracking watchers
 * if (!isEqual(oldBasket, newBasket)) {
 *   trackBasketChange()
 * }
 * ```
 */
export const isEqual = <T>(x: T, y: T): boolean => {
  if (Object.is(x, y)) {
    return true
  }

  // Date comparison by timestamp
  if (x instanceof Date && y instanceof Date) {
    return x.getTime() === y.getTime()
  }

  // RegExp comparison by string representation
  if (x instanceof RegExp && y instanceof RegExp) {
    return x.toString() === y.toString()
  }

  // Primitives and null use strict equality
  if (
    typeof x !== 'object' ||
    x === null ||
    typeof y !== 'object' ||
    y === null
  ) {
    return x === y
  }

  // Deep object comparison
  const keys = Object.keys(x) as (keyof T)[]

  return (
    keys.length === Object.keys(y).length &&
    keys.every((key) => Reflect.has(y, key) && isEqual(x[key], y[key]))
  )
}

/**
 * Generates array of quantity options for selection dropdowns.
 * Caps maximum at 10 items, optionally includes zero for "remove" functionality.
 *
 * @param quantity - Maximum quantity to generate (capped at 10, defaults to 0)
 * @param excludeZero - Whether to exclude 0 from the list (defaults to false)
 *
 * @returns Array of numbers from 0 (or 1) up to the quantity limit
 *
 * @example
 * ```ts
 * // Basket item quantity selector with remove option
 * getQuantitySelectionList(5) // [0, 1, 2, 3, 4, 5]
 *
 * // Product quantity selector (no zero option)
 * getQuantitySelectionList(5, true) // [1, 2, 3, 4, 5]
 *
 * // Large stock still caps at 10
 * getQuantitySelectionList(100) // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 * ```
 */
export const getQuantitySelectionList = (quantity = 0, excludeZero = false) => {
  const length = Math.max(Math.min(quantity, 10), 0)

  const quantityListWithoutZero = Array.from(
    { length },
    (_, index) => index + 1,
  )

  return excludeZero ? quantityListWithoutZero : [0, ...quantityListWithoutZero]
}

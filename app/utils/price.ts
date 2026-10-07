import type { Order } from '@scayle/storefront-nuxt'

/** Applied fees from order cost data. */
export type AppliedFees = Order['cost']['appliedFees']

/**
 * Calculates total shipping cost from order fees in cents.
 * Filters only delivery-category fees and sums their amounts.
 *
 * @param appliedFees - Fees applied to order (defaults to empty array)
 * @param options - Configuration for tax inclusion
 * @param options.includeTax - Whether to include tax in calculation (defaults to false)
 *
 * @returns Total shipping cost in cents
 *
 * @example
 * ```ts
 * // Used in payment summary to display shipping with tax
 * const shippingCost = getShippingCost(order.cost.appliedFees, { includeTax: true })
 * formatCurrency(shippingCost)
 *
 * // Used in tracking to get net shipping cost
 * const shippingNetFee = getShippingCost(orderData.cost.appliedFees)
 * divideByHundred(shippingNetFee) // Convert to decimal for analytics
 * ```
 */
export const getShippingCost = (
  appliedFees: AppliedFees = [],
  options: { includeTax: boolean } = { includeTax: false },
): number => {
  if (!appliedFees?.length) {
    return 0
  }

  return appliedFees
    .filter((fee) => fee.category === 'delivery')
    .reduce((total, fee) => {
      return (
        total +
        (options.includeTax ? fee.amount.withTax : fee.amount.withoutTax)
      )
    }, 0)
}

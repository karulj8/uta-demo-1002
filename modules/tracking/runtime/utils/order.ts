import type { AppliedReduction } from '@scayle/storefront-nuxt'
import type { OrderItem, Order } from '#shared/types/order'

/**
 * Sums reduction amounts for a specific category from an array of reductions.
 * Used internally to calculate discount totals by category.
 *
 * @param reductions - Array of applied reductions, or undefined
 * @param category - Category to filter by ('sale', 'campaign', or 'promotion')
 * @returns Sum of reduction amounts in cents for the specified category, or 0 if no reductions
 */
const sumReductionsByCategory = (
  reductions?: AppliedReduction[],
  category?: AppliedReduction['category'],
): number => {
  if (!reductions) {
    return 0
  }
  return reductions.reduce((sum: number, reduction: AppliedReduction) => {
    if (reduction.category !== category) {
      return sum
    }
    return sum + reduction.amount.absoluteWithTax
  }, 0)
}

/**
 * Sums reduction amounts for a specific category across all order items.
 * Used internally to calculate total discounts by category for an entire order.
 *
 * @param orderItems - Array of order items, or undefined
 * @param category - Category to filter by ('sale', 'campaign', or 'promotion')
 * @returns Sum of reduction amounts in cents for the specified category across all items
 */
const sumReductionsFromAllOrderItemsPerCategory = (
  orderItems: Order['items'],
  category: AppliedReduction['category'],
): number => {
  if (!orderItems) {
    return 0
  }
  return orderItems.reduce((sum: number, orderItem: OrderItem) => {
    return (
      sum +
      sumReductionsByCategory(
        orderItem?.price?.appliedReductions as AppliedReduction[],
        category,
      )
    )
  }, 0)
}

/**
 * Calculates the total promotion discount amount across all order items.
 * Used in purchase event tracking to populate promotion_reduction_with_tax field.
 *
 * @param orderItems - Array of order items from an order
 * @returns Total promotion discount amount in cents
 *
 * @example
 * ```ts
 * const promotionDiscount = sumPromotionReductionsFromAllOrderItems(order.items)
 * // Returns: 5000 (50.00 EUR in cents)
 * ```
 */
export const sumPromotionReductionsFromAllOrderItems = (
  orderItems: Order['items'],
): number => {
  return sumReductionsFromAllOrderItemsPerCategory(orderItems, 'promotion')
}

/**
 * Calculates the total campaign discount amount across all order items.
 * Used in purchase event tracking to populate campaign_reduction_with_tax field.
 *
 * @param orderItems - Array of order items from an order
 * @returns Total campaign discount amount in cents
 *
 * @example
 * ```ts
 * const campaignDiscount = sumCampaignReductionsFromAllOrderItems(order.items)
 * // Returns: 3000 (30.00 EUR in cents)
 * ```
 */
export const sumCampaignReductionsFromAllOrderItems = (
  orderItems: Order['items'],
): number => {
  return sumReductionsFromAllOrderItemsPerCategory(orderItems, 'campaign')
}

/**
 * Calculates the total sale discount amount across all order items.
 * Used in purchase event tracking to populate sale_reduction_with_tax field.
 *
 * @param orderItems - Array of order items from an order
 * @returns Total sale discount amount in cents
 *
 * @example
 * ```ts
 * const saleDiscount = sumSaleReductionsFromAllOrderItems(order.items)
 * // Returns: 2000 (20.00 EUR in cents)
 * ```
 */
export const sumSaleReductionsFromAllOrderItems = (
  orderItems: Order['items'],
) => {
  return sumReductionsFromAllOrderItemsPerCategory(orderItems, 'sale')
}

/**
 * Extracts unique promotion IDs from all order items.
 * Used in purchase event tracking to populate promotions field in ecommerce payload.
 *
 * @param order - Order object containing items with promotions
 * @returns Array of unique promotion IDs, or empty array if no promotions found
 *
 * @example
 * ```ts
 * const promotionIds = getPromotionIdsFromOrder(order)
 * // Returns: ['promo-123', 'promo-456']
 * ```
 */
export const getPromotionIdsFromOrder = (order: Order): string[] => {
  if (!order.items) {
    return []
  }

  const orderItemPromotionIds = order.items.flatMap(
    (item) => item.promotions?.map((promotion) => promotion.id) ?? [],
  )

  return orderItemPromotionIds.reduce((acc: string[], promotionId: string) => {
    if (acc.includes(promotionId)) {
      return acc
    }

    return [...acc, promotionId]
  }, [] as string[])
}

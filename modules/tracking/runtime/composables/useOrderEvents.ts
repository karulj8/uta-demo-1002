import {
  sumPromotionReductionsFromAllOrderItems,
  sumCampaignReductionsFromAllOrderItems,
  sumSaleReductionsFromAllOrderItems,
  getPromotionIdsFromOrder,
} from '../utils/order'
import { formatPrice, getEcommercePrice } from '../utils/price'
import { mapProductToTracking, mapVariantToTracking } from '../utils/product'
import { useTracking } from './useTracking'
import { useLog } from '#storefront/composables'
import type { Order } from '#shared/types/order'

/**
 * Composable for tracking order-related events in the checkout and order success flows.
 * Used on order success pages to track completed purchases with full transaction details.
 *
 * @returns Object containing tracking functions for order events
 *
 * @example
 * ```ts
 * // Used in order success page
 * const { trackPurchase } = useOrderEvents()
 *
 * // Track completed purchase after order confirmation
 * if (orderData.value && status.value === 'success') {
 *   trackPurchase(orderData.value)
 * }
 * ```
 */
export function useOrderEvents() {
  const { push } = useTracking()
  const log = useLog('useOrderEvents')
  /**
   * Tracks a completed purchase event with full order transaction details.
   * Used on order success pages after successful order confirmation to send purchase analytics.
   * Calculates and includes sale, campaign, and promotion reductions from all order items.
   *
   * @param order Complete order object containing transaction ID, customer info, cost breakdown, shipping, payment, and items
   *
   * @example
   * ```ts
   * // Track purchase after order confirmation
   * const order = await useOrderConfirmation({ params: { cbdToken } })
   * if (order.data.value && order.status.value === 'success') {
   *   trackPurchase(order.data.value)
   * }
   * ```
   */
  const trackPurchase = (order: Order) => {
    if (import.meta.server) {
      log.debug('`trackPurchase` is not available on the server')
      return
    }

    const saleReductionWithTax = sumSaleReductionsFromAllOrderItems(order.items)

    const campaignReductionWithTax = sumCampaignReductionsFromAllOrderItems(
      order.items,
    )

    const promotionReductionWithTax = sumPromotionReductionsFromAllOrderItems(
      order.items,
    )

    push({
      event: 'purchase',
      ecommerce: {
        transaction_id: order.id.toString(),
        customer_id: order.customer?.id.toString(),
        value: formatPrice(order.cost.withTax),
        sale_reduction_with_tax: formatPrice(saleReductionWithTax),
        campaign_reduction_with_tax: formatPrice(campaignReductionWithTax),
        promotion_reduction_with_tax: formatPrice(promotionReductionWithTax),
        tax: formatPrice(order.cost.tax.vat?.amount),
        shipping: formatPrice(order.shipping?.deliveryCosts),
        currency: order.currencyCode,
        payment_type: order.payment?.[0]?.key,
        items:
          order.items?.map((item) => ({
            ...mapProductToTracking(item.product),
            ...mapVariantToTracking(item.variant),
            ...getEcommercePrice(item.price),
            currency: item.currency,
          })) ?? [],
        promotions: getPromotionIdsFromOrder(order),
      },
    })
  }

  return {
    trackPurchase,
  }
}

import type { BasketItem, BasketTotalPrice } from '@scayle/storefront-nuxt'
import {
  getSalePriceFromAppliedReductions,
  getCampaignPriceFromAppliedReductions,
  getPromotionPriceFromAppliedReductions,
  formatPrice,
} from '../utils/price'
import { mapBasketItemToTracking } from '../utils/basket'
import type { CheckoutEvent } from '../types'
import { useTracking } from './useTracking'
import { useBasketEvents } from './useBasketEvents'
import { useLog } from '#storefront/composables'

/**
 * Provides tracking functions for checkout-related events.
 * Used in checkout pages and flows to track checkout progress, shipping, payment, and completion.
 *
 * @returns Object with tracking functions for checkout events.
 *
 * @example
 * ```ts
 * // Used in checkout page
 * const { trackBeginCheckout, trackAddShippingInfo, trackAddPaymentInfo, trackCompleteCheckout } = useCheckoutEvents()
 * const { cost, items } = useBasket()
 *
 * // Track checkout start
 * trackBeginCheckout(cost, 'regular')
 *
 * // Track shipping selection
 * trackAddShippingInfo('standard', 'DHL', 'EUR', 500, items)
 *
 * // Track payment selection
 * trackAddPaymentInfo('credit_card', items)
 *
 * // Track checkout completion
 * trackCompleteCheckout(items)
 * ```
 */
export function useCheckoutEvents() {
  const { push } = useTracking()
  const { trackAddToBasket, trackRemoveFromBasket } = useBasketEvents()
  const log = useLog('useCheckoutEvents')

  /**
   * Tracks when user begins the checkout process.
   * Used in checkout pages to record checkout initiation with cost breakdown and checkout type.
   *
   * @param cost Basket total price with applied reductions and tax information (optional)
   * @param checkoutType Type of checkout flow: 'regular' or 'express' (optional)
   */
  const trackBeginCheckout = (
    cost?: BasketTotalPrice,
    checkoutType?: 'regular' | 'express',
  ) => {
    if (import.meta.server) {
      log.debug('`trackBeginCheckout` is not available on the server')
      return
    }

    const campaignPrice = getCampaignPriceFromAppliedReductions(
      cost?.appliedReductions ?? [],
    )
    const salePrice = getSalePriceFromAppliedReductions(
      cost?.appliedReductions ?? [],
    )
    const promotionPrice = getPromotionPriceFromAppliedReductions(
      cost?.appliedReductions ?? [],
    )

    push({
      event: 'begin_checkout',
      value: formatPrice(cost?.withTax),
      sale_reduction_with_tax: formatPrice(salePrice),
      promotion_reduction_with_tax: formatPrice(promotionPrice),
      campaign_reduction_with_tax: formatPrice(campaignPrice),
      tax: formatPrice(cost?.tax.vat.amount),
      checkout_type: checkoutType,
    })
  }

  /**
   * Tracks when user adds shipping information during checkout.
   * Used in checkout shipping step to record shipping method selection with basket items.
   *
   * @param shippingType Type of shipping service
   * @param shippingMethod Shipping provider name
   * @param currency Currency code for shipping value
   * @param value Shipping cost in currency units (not cents)
   * @param basketItems Array of basket items included in the checkout
   */
  const trackAddShippingInfo = (
    shippingType: string,
    shippingMethod: string,
    currency: string,
    value: number,
    basketItems?: BasketItem[],
  ) => {
    if (import.meta.server) {
      log.debug('`trackAddShippingInfo` is not available on the server')
      return
    }

    const items = basketItems?.map((item, index) => {
      return {
        ...mapBasketItemToTracking(item),
        index,
      }
    })

    push({
      event: 'add_shipping_info',
      shipping_type: shippingType,
      shipping_method: shippingMethod,
      currency: currency,
      value: value,
      ecommerce: { items },
    })
  }

  /**
   * Tracks when user adds payment information during checkout.
   * Used in checkout payment step to record payment method selection with basket items.
   *
   * @param paymentType Payment method identifier (e.g., 'credit_card', 'paypal')
   * @param basketItems Array of basket items included in the checkout
   */
  const trackAddPaymentInfo = (
    paymentType: string,
    basketItems?: BasketItem[],
  ) => {
    if (import.meta.server) {
      log.debug('`trackAddPaymentInfo` is not available on the server')
      return
    }

    const items = basketItems?.map((item, index) => {
      return {
        ...mapBasketItemToTracking(item),
        index,
      }
    })

    push({
      event: 'add_payment_info',
      payment_type: paymentType,
      ecommerce: { items },
    })
  }

  /**
   * Tracks checkout completion with success or error status.
   * Used when checkout process completes to record final checkout outcome.
   *
   * @param basketItems Array of basket items that were checked out (required)
   */
  const trackCompleteCheckout = (basketItems: BasketItem[]) => {
    if (import.meta.server) {
      log.debug('`trackCompleteCheckout` is not available on the server')
      return
    }

    const items = basketItems.map((item, index) => {
      return {
        ...mapBasketItemToTracking(item),
        index,
      }
    })

    push({
      event: 'complete_checkout',
      ecommerce: {
        items,
      },
    })
  }

  /**
   * Handles tracking events from the checkout web component.
   * Used in checkout pages to track checkout progress, shipping, payment, and completion events.
   *
   * @param event The checkout event to handle.
   * @param basketItems The basket items to track.
   */
  const handleTrackingEvent = (
    event: MessageEvent<CheckoutEvent>,
    basketItems: BasketItem[],
  ) => {
    if (import.meta.server) {
      log.debug('`handleTrackingEvent` is not available on the server')
      return
    }

    const eventData = event.data.event

    if (!eventData) {
      return
    }

    const actionType = eventData.event

    if (actionType === 'add_to_cart') {
      const item = eventData.ecommerce?.items?.[0]?.item_id
      const basketItem = basketItems.find(
        (basketItem) => basketItem.product.id.toString() === item,
      )

      if (basketItem) {
        trackAddToBasket(
          basketItem.variant,
          basketItem.product,
          basketItem.quantity,
        )
      }
    } else if (actionType === 'remove_from_cart') {
      const item = eventData.ecommerce?.items?.[0]?.item_id
      const basketItem = basketItems.find(
        (basketItem) => basketItem.product.id.toString() === item,
      )

      if (basketItem) {
        trackRemoveFromBasket(basketItem, 'checkout')
      }
    } else if (actionType === 'add_payment_info') {
      trackAddPaymentInfo(eventData.payment_type ?? '', basketItems)
    } else if (actionType === 'complete_checkout') {
      trackCompleteCheckout(basketItems)
    } else if (
      actionType === 'feature' &&
      eventData.name === 'add_shipping_info'
    ) {
      trackAddShippingInfo(
        eventData.shipping_type ?? '',
        eventData.shipping_method ?? '',
        eventData.ecommerce?.currency ?? '',
        eventData.ecommerce?.value ?? 0,
        basketItems,
      )
    }
  }

  return {
    trackBeginCheckout,
    trackAddShippingInfo,
    trackAddPaymentInfo,
    trackCompleteCheckout,
    handleTrackingEvent,
  }
}

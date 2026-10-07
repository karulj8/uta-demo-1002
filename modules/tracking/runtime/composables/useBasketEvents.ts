import type {
  BasketTotalPrice,
  BasketItem,
  Variant,
  Product,
} from '@scayle/storefront-nuxt'
import {
  getSalePriceFromAppliedReductions,
  getCampaignPriceFromAppliedReductions,
  getPromotionPriceFromAppliedReductions,
  formatPrice,
} from '../utils/price'
import { mapBasketItemToTracking } from '../utils/basket'
import { mapProductToTracking, mapVariantToTracking } from '../utils/product'
import type { TrackingInteractionSource } from '../types/tracking'
import { useTracking } from './useTracking'
import { useLog } from '#storefront/composables'

/**
 * Provides tracking functionality for basket-related events.
 *
 * This composable tracks basket state changes and sends cart events to GTM
 * with detailed basket information including items, totals, and applied
 * reductions. Used in the GTM plugin to track initial basket state and
 * throughout the application to track basket updates.
 *
 * The composable formats currency values and extracts reduction information
 * from campaign, sale, and promotion categories before sending events.
 *
 * @returns An object with `trackBasket` function for tracking basket events.
 *
 * @example
 * ```ts
 * const { trackBasket } = useBasketEvents()
 * const { cost, items } = useBasket()
 *
 * trackBasket(cost, items)
 * ```
 */
export function useBasketEvents() {
  const { push } = useTracking()
  const log = useLog('useBasketEvents')

  /**
   * Tracks a basket event with cost and item information.
   *
   * This function sends a `cart` event to GTM with formatted basket data.
   * It extracts and formats reduction amounts from campaign, sale, and
   * promotion categories, formats total prices with and without tax, and
   * maps basket items to ecommerce format for tracking.
   *
   * The function handles optional parameters gracefully - if cost or items
   * are not provided, it uses empty arrays or undefined values as appropriate.
   * All currency values are formatted using the shop's currency format.
   *
   * Used in the GTM plugin to track initial basket state after basket data
   * is loaded, and can be called manually to track basket updates.
   *
   * @param cost Basket total price information including with/without tax
   * amounts and applied reductions. If not provided, totals and reductions
   * will be undefined in the tracking event.
   * @param items Array of basket items to track. If not provided, an empty
   * array is used and no items are included in the ecommerce data.
   */
  const trackBasket = (cost?: BasketTotalPrice, items?: BasketItem[]) => {
    if (import.meta.server) {
      log.debug('`trackBasket` is not available on the server')
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
      event: 'cart',
      total_campaign_reduction_with_tax: formatPrice(campaignPrice),
      total_sale_reduction_with_tax: formatPrice(salePrice),
      total_promotion_reduction_with_tax: formatPrice(promotionPrice),
      total_with_tax: formatPrice(cost?.withTax),
      total_without_tax: formatPrice(cost?.withoutTax),
      total_tax: formatPrice(cost?.tax.vat.amount),
      ecommerce: { items: (items ?? []).map(mapBasketItemToTracking) },
    })
  }

  /**
   * Tracks the add to basket event.
   * Sends an event with the variant and product data.
   *
   * @param variant - The variant to track.
   * @param product - The product to track.
   * @param quantity - The quantity of the product.
   * @param interactionSource - The interaction source of the page context.
   *
   * @returns void
   */
  const trackAddToBasket = (
    variant: Variant,
    product: Product,
    quantity: number = 1,
    interactionSource?: TrackingInteractionSource,
  ) => {
    if (import.meta.server) {
      log.debug('`trackAddToBasket` is not available on the server')
      return
    }

    push({
      event: 'add_to_cart',
      ecommerce: {
        items: [
          {
            ...mapProductToTracking(product),
            ...mapVariantToTracking(variant),
            quantity,
          },
        ],
      },
      page: interactionSource
        ? { interaction_source: interactionSource }
        : undefined,
    })
  }

  /**
   * Tracks the remove from basket event.
   * Sends an event with the basket item data.
   *
   * @param item - The basket item to track.
   * @param interactionSource - The interaction source of the page context.
   *
   * @returns void
   */
  const trackRemoveFromBasket = (
    item: BasketItem,
    interactionSource?: TrackingInteractionSource,
  ) => {
    if (import.meta.server) {
      log.debug('`trackRemoveFromBasket` is not available on the server')
      return
    }

    push({
      event: 'remove_from_cart',
      ecommerce: { items: [mapBasketItemToTracking(item)] },
      page: interactionSource
        ? { interaction_source: interactionSource }
        : undefined,
    })
  }

  /**
   * Tracks the view cart event.
   * Sends an event with the basket item data.
   *
   * @param items - The basket items to track.
   *
   * @returns void
   */
  const trackViewCart = (basketItems?: BasketItem[]) => {
    if (import.meta.server) {
      log.debug('`trackViewCart` is not available on the server')
      return
    }

    const items = (basketItems ?? []).map((item, index) => ({
      ...mapBasketItemToTracking(item),
      index,
    }))

    push({
      event: 'view_cart',
      ecommerce: { items },
    })
  }
  return {
    trackBasket,
    trackAddToBasket,
    trackRemoveFromBasket,
    trackViewCart,
  }
}

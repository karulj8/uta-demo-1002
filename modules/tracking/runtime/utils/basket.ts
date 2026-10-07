import type { BasketItem } from '@scayle/storefront-nuxt'
import type { TrackingEcommerceItem } from '../types'
import { getEcommercePrice } from './price'
import { mapProductToTracking, mapVariantToTracking } from './product'

/**
 * Maps a basket item to an ecommerce item.
 * Used in basket event tracking to map basket items to ecommerce items.
 *
 * @example
 * ```ts
 * const basketItem = {
 *   product: productFactory.build(),
 *   variant: variantFactory.build(),
 *   quantity: 1,
 * }
 * const trackingItem = mapBasketItemToTracking(basketItem)
 * // Returns: { item_id: '123', quantity: 1, currency: 'EUR', sold_out: false, promotions: ['123'], ... }
 * ```
 *
 * @param basketItem - The basket item to map.
 * @returns The ecommerce item.
 */
export const mapBasketItemToTracking = (
  basketItem: BasketItem,
): TrackingEcommerceItem => {
  const promotions = basketItem.promotions
    ?.filter((promotion) => promotion.isValid)
    .map((promotion) => promotion.id)

  return {
    ...mapProductToTracking(basketItem.product),
    ...mapVariantToTracking(basketItem.variant),
    quantity: basketItem.quantity,
    sold_out: basketItem.status !== 'available',
    promotions,
    ...getEcommercePrice(basketItem.price.unit),
  }
}

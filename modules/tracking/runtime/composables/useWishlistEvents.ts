import type { Product, WishlistItem } from '@scayle/storefront-nuxt'
import { mapProductToTracking, mapVariantToTracking } from '../utils/product'
import { useTracking } from './useTracking'
import { useLog } from '#storefront/composables'

/**
 * Provides tracking functionality for wishlist-related events.
 *
 * This composable tracks wishlist state changes and sends wishlist events
 * to GTM with wishlist item information. Used in the GTM plugin to track
 * initial wishlist state and throughout the application to track wishlist
 * updates when items are added or removed.
 *
 * @returns An object with `trackWishlist` function for tracking wishlist events.
 *
 * @example
 * ```ts
 * const { trackWishlist, trackAddToWishlist, trackRemoveFromWishlist } = useWishlistEvents()
 * const { items } = useWishlist()
 *
 * trackWishlist(items)
 * trackAddToWishlist(product, 'product_detail')
 * trackRemoveFromWishlist(product, 'product_detail')
 * ```
 */
export function useWishlistEvents() {
  const { push } = useTracking()
  const log = useLog('useWishlistEvents')

  /**
   * Tracks a wishlist event with item information.
   *
   * This function sends a `wishlist` event to GTM with wishlist item data
   * mapped to ecommerce format. The items are transformed to include product
   * identifiers, names, prices, and other tracking-relevant information.
   *
   * The function handles optional parameters gracefully - if items are not
   * provided, an empty array is used and no items are included in the
   * ecommerce data.
   *
   * Used in the GTM plugin to track initial wishlist state after wishlist
   * data is loaded, and can be called manually to track wishlist updates
   * when items are added or removed.
   *
   * @param items Array of wishlist items to track. If not provided, an empty
   * array is used and no items are included in the ecommerce data.
   */
  const trackWishlist = (items?: WishlistItem[]) => {
    if (import.meta.server) {
      log.debug('`trackWishlist` is not available on the server')
      return
    }

    push({
      event: 'wishlist',
      ecommerce: {
        items:
          items?.map((item) => ({
            ...mapProductToTracking(item.product),
            ...(item.variant ? mapVariantToTracking(item.variant) : {}),
          })) ?? [],
      },
    })
  }

  /**
   * Tracks an add to wishlist event and sends it to GTM with product data.
   *
   * Sends an `add_to_wishlist` event to GTM with the product mapped to ecommerce
   * format, including product identifiers, names, prices, and other tracking
   * information. The event includes an optional item list name to identify the
   * source location where the product was added (e.g., product detail page,
   * recommendation slider, recently viewed products).
   *
   * @param product Product that was added to the wishlist
   * @param itemListName Optional identifier for the list or page where the
   * product was added (e.g., `'product_detail'`, `'recommendation_slider'`,
   * `'recently_viewed_slider'`).
   * @param index Optional zero-based position of the product in the list.
   */
  const trackAddToWishlist = (
    product: Product,
    itemListName?: string,
    index?: number,
  ) => {
    if (import.meta.server) {
      log.debug('`trackAddToWishlist` is not available on the server')
      return
    }

    push({
      event: 'add_to_wishlist',
      item_list_name: itemListName,
      ecommerce: {
        items: [
          {
            ...mapProductToTracking(product),
            item_list_name: itemListName,
            index,
          },
        ],
      },
    })
  }

  /**
   * Tracks a remove from wishlist event and sends it to GTM with product data.
   *
   * Sends a `remove_from_wishlist` event to GTM with the product mapped to
   * ecommerce format, including product identifiers, names, prices, and other
   * tracking information. The event includes an optional item list name to
   * identify the source location where the product was removed (e.g., product
   * detail page, recommendation slider, recently viewed products).
   *
   * @param product Product that was removed from the wishlist
   * @param itemListName Optional identifier for the list or page where the
   * product was removed (e.g., `'product_detail'`, `'recommendation_slider'`,
   * `'recently_viewed_slider'`).
   * @param index Optional zero-based position of the product in the list.
   */
  const trackRemoveFromWishlist = (
    product: Product,
    itemListName?: string,
    index?: number,
  ) => {
    if (import.meta.server) {
      log.debug('`trackRemoveFromWishlist` is not available on the server')
      return
    }

    push({
      event: 'remove_from_wishlist',
      item_list_name: itemListName,
      ecommerce: {
        items: [
          {
            ...mapProductToTracking(product),
            item_list_name: itemListName,
            index,
          },
        ],
      },
    })
  }

  return {
    trackWishlist,
    trackAddToWishlist,
    trackRemoveFromWishlist,
  }
}

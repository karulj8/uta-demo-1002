import type { Product, Variant } from '@scayle/storefront-nuxt'
import { mapProductToTracking, mapVariantToTracking } from '../utils/product'
import { useTracking } from './useTracking'
import { useLog } from '#storefront/composables'

/**
 * Provides tracking functionality for product-related events.
 *
 * This composable tracks product interactions and sends product events to GTM
 * with product data mapped to ecommerce format. Includes functions for tracking
 * individual product views, product selections, and product list views.
 *
 * @returns An object with functions for tracking product events: `trackViewItem`,
 * `trackSelectItem`, and `trackViewItemList`.
 *
 * @example
 * ```ts
 * const { trackViewItem, trackSelectItem, trackViewItemList } = useProductEvents()
 *
 * trackViewItem(product)
 * trackSelectItem(product, 'recommendation_slider', 2)
 * trackViewItemList(products, 'recommendation_slider')
 * ```
 */
export function useProductEvents() {
  const { push } = useTracking()
  const log = useLog('useProductEvents')

  /**
   * Tracks a view item event and sends it to GTM with product data.
   *
   * Sends a `view_item` event to GTM with the product mapped to ecommerce format,
   * including product identifiers, names, prices, and other tracking information.
   * If a variant is provided, variant-specific data is included in the tracking
   * event. The function handles null or undefined products gracefully by
   * returning early without sending an event.
   *
   * @param product Product to track. If null or undefined, no event is sent.
   * @param variant Optional variant to include variant-specific tracking data
   * (e.g., variant ID, variant name, variant price).
   */
  const trackViewItem = (product?: Product | null, variant?: Variant) => {
    if (import.meta.server) {
      log.debug('`trackViewItem` is not available on the server')
      return
    }

    if (!product) {
      return
    }

    push({
      event: 'view_item',
      ecommerce: {
        items: [
          {
            ...mapProductToTracking(product),
            ...(variant ? mapVariantToTracking(variant) : {}),
          },
        ],
      },
    })
  }

  /**
   * Tracks a select item event and sends it to GTM with product data.
   *
   * Sends a `select_item` event to GTM with the product mapped to ecommerce format,
   * including product identifiers, names, prices, and other tracking information.
   *
   * @param product Product that was selected.
   * @param itemListName Optional identifier for the list where the product was
   * selected (e.g., `'recommendation_slider'`, `'recently_viewed_slider'`).
   * @param index Optional zero-based position of the product in the list.
   */
  const trackSelectItem = (
    product: Product,
    itemListName?: string,
    index?: number,
  ) => {
    if (import.meta.server) {
      log.debug('`trackSelectItem` is not available on the server')
      return
    }

    const item = mapProductToTracking(product)

    push({
      event: 'select_item',
      item_list_name: itemListName,
      ecommerce: {
        items: [{ ...item, index, item_list_name: itemListName }],
      },
    })
  }

  /**
   * Tracks a view item list event and sends it to GTM with product data.
   *
   * Sends a `view_item_list` event to GTM with all products in the list mapped to
   * ecommerce format, including product identifiers, names, prices, and other
   * tracking information. Each product in the list is included with its position
   * index and optional list name to identify the source of the product list.
   *
   * @param products Array of products in the list to track. Each product is
   * mapped to ecommerce format with its position index included.
   * @param itemListName Optional identifier for the list being viewed
   * (e.g., `'recommendation_slider'`, `'recently_viewed_slider'`, `'gift_products'`).
   * @param searchTerm Optional search term used to filter the products in the list.
   */
  const trackViewItemList = (
    products: Product[],
    itemListName?: string,
    searchTerm?: string,
  ) => {
    if (import.meta.server) {
      log.debug('`trackViewItemList` is not available on the server')
      return
    }

    push({
      event: 'view_item_list',
      item_list_name: itemListName,
      search_term: searchTerm,
      ecommerce: {
        items: products.map((product, index) => ({
          ...mapProductToTracking(product),
          index,
          item_list_name: itemListName,
        })),
      },
    })
  }

  return {
    trackViewItem,
    trackSelectItem,
    trackViewItemList,
  }
}

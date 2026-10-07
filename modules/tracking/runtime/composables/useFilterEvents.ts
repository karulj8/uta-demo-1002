import type { TrackingSorting } from '../types'
import { useTracking } from './useTracking'
import { useLog } from '#storefront/composables'

/**
 * Composable for tracking filter and sorting interactions on product listing pages.
 * Used in filter components and category pages to track user filter selections and sorting changes.
 *
 * @returns Object containing tracking functions for filter and sorting events
 *
 * @example
 * ```ts
 * // Used in useFilter composable
 * const { trackApplyFilter, trackRemoveFilter, trackSorting } = useFilterEvents()
 *
 * // Track applying a price filter
 * trackApplyFilter('min_price', 10.99)
 *
 * // Track removing an attribute filter
 * trackRemoveFilter('color', 'red')
 *
 * // Track sorting change
 * trackSorting('price_asc')
 * ```
 */
export function useFilterEvents() {
  const { push } = useTracking()
  const log = useLog('useFilterEvents')

  /**
   * Tracks when a filter is applied to product listings.
   * Used in filter components to track attribute filters, price filters, reduction filters, and boolean filters.
   *
   * @param type Filter identifier (e.g., attribute slug like 'color', 'size', or filter keys like 'min_price', 'max_price')
   * @param value Filter value (string for attributes, number for prices, boolean for boolean filters)
   *
   * @example
   * ```ts
   * // Track applying a color attribute filter
   * trackApplyFilter('color', 'red')
   *
   * // Track applying a price range filter
   * trackApplyFilter('min_price', 10.99)
   * trackApplyFilter('max_price', 99.99)
   *
   * // Track applying a boolean filter
   * trackApplyFilter('sale', true)
   * ```
   */
  const trackApplyFilter = (type: string, value: string | boolean | number) => {
    if (import.meta.server) {
      log.debug('`trackApplyFilter` is not available on the server')
      return
    }

    push({
      event: 'filter',
      action: 'apply',
      type,
      value,
    })
  }

  /**
   * Tracks when a filter is removed from product listings.
   * Used in filter components when users deselect or remove previously applied filters.
   *
   * @param type Filter identifier (e.g., attribute slug like 'color', 'size', or filter keys like 'min_price', 'max_price')
   * @param value Filter value that was removed (string for attributes, boolean for boolean filters)
   *
   * @example
   * ```ts
   * // Track removing a color attribute filter
   * trackRemoveFilter('color', 'red')
   *
   * // Track removing a boolean filter
   * trackRemoveFilter('sale', true)
   * ```
   */
  const trackRemoveFilter = (type: string, value: string | boolean) => {
    if (import.meta.server) {
      log.debug('`trackRemoveFilter` is not available on the server')
      return
    }

    push({
      event: 'filter',
      action: 'remove',
      type,
      value,
    })
  }

  /**
   * Tracks when a filter is reset to its default state.
   * Used in filter components when users clear or reset filter selections.
   *
   * @param type Filter identifier (e.g., attribute slug like 'color', 'size', or filter keys like 'min_price', 'max_price')
   * @param value Filter value that was reset (string for attributes, boolean for boolean filters)
   *
   * @example
   * ```ts
   * // Track resetting a price filter
   * trackResetFilter('min_price', '')
   *
   * // Track resetting a boolean filter
   * trackResetFilter('sale', false)
   * ```
   */
  const trackResetFilter = (type: string, value: string | boolean) => {
    if (import.meta.server) {
      log.debug('`trackResetFilter` is not available on the server')
      return
    }

    push({
      event: 'filter',
      action: 'reset',
      type,
      value,
    })
  }

  /**
   * Tracks when product sorting is changed on listing pages.
   * Used in sorting components and category pages to track user sorting preferences.
   *
   * @param value Sorting option selected by the user (e.g., 'price_asc', 'price_desc', 'top_seller', 'date_newest', 'reduction_desc')
   *
   * @example
   * ```ts
   * // Track sorting by price ascending
   * trackSorting('price_asc')
   *
   * // Track sorting by newest products
   * trackSorting('date_newest')
   *
   * // Track sorting by top sellers
   * trackSorting('top_seller')
   * ```
   */
  const trackSorting = (value: TrackingSorting) => {
    if (import.meta.server) {
      log.debug('`trackSorting` is not available on the server')
      return
    }

    push({
      event: 'filter',
      action: 'apply',
      type: 'sorting',
      value,
    })
  }

  /**
   * Tracks when the filter flyout is opened or closed.
   * Used in filter components to track user filter flyout interactions.
   *
   * @param isOpen Whether the filter flyout is open or closed.
   *
   * @example
   * ```ts
   * // Track filter flyout opening
   * trackFilterView(true)
   *
   * // Track filter flyout closing
   * trackFilterView(false)
   * ```
   */
  const trackFilterView = (isOpen: boolean) => {
    if (import.meta.server) {
      log.debug('`trackFilterView` is not available on the server')
      return
    }

    push({
      event: 'filter',
      action: 'view',
      type: 'flyout',
      value: isOpen ? 'open' : 'close',
    })
  }

  /**
   * Tracks when the "View All" button is clicked.
   * Used in filter components to track user "View All" interactions.
   *
   * @example
   * ```ts
   * // Track "View All" button click
   * trackViewAll()
   * ```
   */
  const trackViewAll = () => {
    if (import.meta.server) {
      log.debug('`trackViewAll` is not available on the server')
      return
    }

    push({
      event: 'filter',
      action: 'view',
      type: 'flyout',
      value: 'view_all',
    })
  }

  return {
    trackApplyFilter,
    trackRemoveFilter,
    trackResetFilter,
    trackSorting,
    trackFilterView,
    trackViewAll,
  }
}

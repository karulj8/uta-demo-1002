import type { SearchEntity } from '@scayle/storefront-nuxt'
import { useTracking } from './useTracking'
import { useLog } from '#storefront/composables'
import { useRouteHelpers } from '~/composables'

/**
 * Gets the search action based on the suggestion.
 *
 * @param suggestion - The suggestion to get the search action for.
 *
 * @returns The search action 'search_term', 'suggested_product', 'suggested_category' or 'suggested_page'.
 */
const getSearchAction = (suggestion: SearchEntity | 'show_all') => {
  if (suggestion === 'show_all') {
    return 'search_term'
  }

  switch (suggestion.type) {
    case 'product':
      return 'suggested_product'
    case 'category':
      return 'suggested_category'
    case 'navigationItem':
      return 'suggested_page'
    default:
      return 'search_term'
  }
}

/**
 * This composable is used to track the search events.
 *
 * @returns The functions to track the search events.
 *
 * @example
 * ```ts
 * const { trackSearch, getSearchDestination } = useSearchEvents()
 *
 * trackSearch({ query: 'shoes', suggestion: 'show_all' })
 * trackSearch({ query: 'shoes', suggestion: { type: 'product', productSuggestion: { product: { id: 123 } } } })
 * trackSearch({ query: 'shoes', suggestion: { type: 'category', categorySuggestion: { category: { id: 456 } } } })
 * trackSearch({ query: 'shoes', suggestion: { type: 'navigationItem', navigationItemSuggestion: { navigationItem: { id: 789 } } } })
 * ```
 */
export function useSearchEvents() {
  const { push } = useTracking()
  const log = useLog('useSearchEvents')

  const {
    getProductDetailRoute,
    buildCategorySuggestionRoute,
    buildNavigationTreeItemRoute,
    getSearchRoute,
  } = useRouteHelpers()

  /**
   * Gets the search destination based on the query and suggestion.
   *
   * @param query - The query to get the search destination for.
   * @param suggestion - The suggestion to get the search destination for.
   *
   * @returns The search destination.
   */
  const getSearchDestination = (
    query: string,
    suggestion: SearchEntity | 'show_all',
  ) => {
    if (suggestion === 'show_all') {
      return getSearchRoute(query)
    }

    if (!suggestion.type) {
      return
    }

    switch (suggestion.type) {
      case 'product':
        return getProductDetailRoute(suggestion.productSuggestion.product.id)
      case 'category':
        return buildCategorySuggestionRoute(suggestion).path
      case 'navigationItem':
        return buildNavigationTreeItemRoute(
          suggestion.navigationItemSuggestion.navigationItem,
        )?.route.toString()
    }
  }

  /**
   * Tracks the search event.
   * Sends an event with the search data.
   *
   * @param query - The query to track.
   * @param suggestion - The suggestion to track.
   *
   * @returns void
   */
  const trackSearch = ({
    query,
    suggestion,
    query_completed,
  }: {
    query: string
    query_completed?: string
    suggestion: SearchEntity | 'show_all'
  }) => {
    if (import.meta.server) {
      log.debug('`trackSearch` is not available on the server')
      return
    }

    const search_destination = getSearchDestination(query, suggestion)
    const search_action = getSearchAction(suggestion)

    push({
      event: 'search',
      search_term: query,
      search_term_completed: query_completed,
      search_action,
      search_destination,
    })
  }

  return {
    trackSearch,
    getSearchDestination,
  }
}

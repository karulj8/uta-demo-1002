import { computed } from 'vue'
import type {
  TrackingPageContext,
  TrackingSessionContext,
} from '../types/tracking'
import { useTrackingContextState } from './useTrackingContextState'
import { useCurrentShop, useUser } from '#storefront/composables'
import packageJson from '~~/package.json'
import { useRoute } from '#app/composables/router'

/**
 * Provides reactive tracking context for page navigation and user sessions.
 * Used in analytics and tracking systems to capture page views, user behavior, and session data.
 * Persists previous page context and landing page across navigation using Nuxt state.
 *
 * @returns page - Current and previous page tracking data (computed ref with current/previous page path and type)
 * @returns session - Session-level tracking data including shop ID, currency, locale, user info, initial page, referrer, and query parameters
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useTrackingContext } from '~/composables/useTrackingContext'
 *
 * const { page, session, setPreviousPageContext } = useTrackingContext()
 *
 * // Use in tracking calls
 * trackEvent('content_view', {
 *   page: page.value,
 *   session: session.value
 * })
 * </script>
 * ```
 */
export function useTrackingContext() {
  const { previousPageContext, currentPageContext, initialPage } =
    useTrackingContextState()

  const currentShop = useCurrentShop()
  const route = useRoute()
  const { user, customerType, isLoggedIn } = useUser()

  const parameter = computed(() => {
    if (!route.query) {
      return ''
    }

    return Object.entries(route.query)
      .map(([key, value]) => `&${key}=${value}`)
      .join('')
  })

  /**
   * Page-level tracking context for navigation and page view analytics.
   * Used in tracking composables to capture current and previous page information.
   * Includes interaction source for tracking user actions that triggered navigation.
   *
   * @returns current_page_path - Current page URL path
   * @returns current_page_type - Current page type identifier (e.g., `pdp`, `category`, `basket`)
   * @returns previous_page_path - Previous page URL path (optional, set during navigation)
   * @returns previous_page_type - Previous page type identifier (optional, set during navigation)
   */
  const pageContext = computed<Omit<TrackingPageContext, 'interaction_source'>>(
    () => ({
      current_page_path: currentPageContext.value.current_page_path,
      current_page_type: currentPageContext.value.current_page_type,
      previous_page_path: previousPageContext.value.previous_page_path,
      previous_page_type: previousPageContext.value.previous_page_type,
    }),
  )

  /**
   * Session-level tracking context for user sessions and session data.
   * Used in tracking composables to capture session-level information.
   * Includes shop information, currency, locale, user info, initial page, referrer, and query parameters.
   *
   * @returns sessionContext - Session-level tracking context for user sessions and session data.
   * @returns shop_id - Shop identifier
   * @returns shop_currency - Shop currency code (ISO 4217 format, e.g., 'EUR', 'USD')
   * @returns locale - Locale identifier (e.g., 'de-DE', 'en-US')
   * @returns shop_version - Application version string
   * @returns landing_page - Absolute URL of the first page visited in this session
   * @returns parameter - Raw query string from the landing page (includes utm_* parameters)
   * @returns referrer - First external referrer URL (optional, only set if user came from external site)
   * @returns customer_id - Customer identifier (optional, only set for logged-in users)
   * @returns customer_type - Customer classification (optional, 'guest', 'new', or 'existing')
   * @returns customer_groups - Customer group identifiers (optional, array of group names)
   * @returns login - Whether user is logged in (defaults to false for guests)
   * @returns login_method - Authentication method used (optional, e.g., 'password')
   * @returns eh - SHA256 hash of user email (optional, never raw email, used for analytics)
   */
  const sessionContext = computed<TrackingSessionContext>(() => ({
    shop_id: currentShop.value?.shopId,
    shop_currency: currentShop.value?.currency,
    locale: currentShop.value?.locale,
    shop_version: packageJson.version,
    landing_page: initialPage.value,
    parameter: parameter.value,
    referrer: import.meta.client ? document.referrer : undefined,
    customer_id: user.value?.id.toString(),
    customer_type: customerType.value,
    customer_groups: user.value?.groups,
    login: isLoggedIn.value,
    login_method: user.value?.authentication?.type,
    eh: user.value?.emailHash,
  }))

  return {
    page: pageContext,
    session: sessionContext,
  }
}

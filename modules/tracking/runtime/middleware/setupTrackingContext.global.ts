import { useTrackingContextState } from '../composables/useTrackingContextState'
import type { PageType } from '../types/tracking'
import { defineNuxtRouteMiddleware } from '#app/composables/router'

/**
 * Global middleware to manage context for tracking.
 * Updates page and session context on navigation.
 *
 * **Behavior:**
 * - Sets `pageState.previousPagePath` from previous route's path
 * - Sets `pageState.previousPageType` from previous route's `pageType` meta property
 * - Sets `sessionContext.landingPage` from current route's path if it is the first page visited in the session
 *
 * **Page Types:**
 * - `pdp` - Product Detail Page
 * - `plp` - Product Listing Page (category)
 * - `basket` - Shopping basket
 * - `checkout` - Checkout process
 * - `account` - Account pages
 * - And more defined in route meta
 *
 * Uses `useTrackingContextState` instead of calling `useTrackingContext` directly.
 * Calling `useTrackingContext` inside middleware also triggers `useUser` within the composable,
 * which causes hydration issues in user-related templates. By using a dedicated state composable,
 * hydration stays clean.
 *
 * The trade-off: user data isn't immediately available for `content_view` tracking.
 * Practically, that just means `content_view` needs to wait until user data resolves before firing.
 * Everything else can be tracked normally event-based.
 *
 * @example
 * ```ts
 * // Automatically applied as global middleware
 * // Route meta: { pageType: 'pdp' }
 * // → Sets pageState.previousPagePath = ''
 * // → Sets pageState.previousPageType = ''
 *
 * // Route meta: { pageType: 'plp' }
 * // → Sets pageState.previousPagePath = '/p/123'
 * // → Sets pageState.previousPageType = 'pdp'
 * ```
 */
export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) {
    return
  }
  const { setInitialPage, setPreviousPageContext, setCurrentPageContext } =
    useTrackingContextState()

  setCurrentPageContext(to.path, to.meta.pageType as PageType)

  // On the first client-side load, Nuxt provides a `from` route
  // where `from.path` is identical to `to.path`.
  // If this is the case, we to capture the landing page.
  if (from.path === to.path) {
    setInitialPage(window.location.href)
    return
  }

  // For all subsequent client-side navigation, set the `from` route as the previous page context.
  setPreviousPageContext(from.path, from.meta.pageType as PageType)
})

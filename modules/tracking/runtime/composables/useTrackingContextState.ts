import type { TrackingPageContext, PageType } from '../types/tracking'
import { useState } from '#app'

/**
 * Provides reactive tracking context state for page navigation and user sessions.
 * Used in analytics and tracking systems to capture page views, user behavior, and session data.
 * Persists previous page context and landing page across navigation using Nuxt state.
 *
 * @returns previousPageContext - Reactive tracking context state for previous page
 * @returns currentPageContext - Reactive tracking context state for current page
 * @returns initialPage - Reactive tracking context state for initial page
 * @returns setPreviousPageContext - Function to update the previous page context
 * @returns setCurrentPageContext - Function to update the current page context
 * @returns setInitialPage - Function to update the initial page
 */
export function useTrackingContextState() {
  /**
   * Reactive tracking context state for previous page.
   * Stores the path and page type of the previous page for analytics.
   *
   * @returns previous_page_path - Previous page URL path (optional, set during navigation)
   * @returns previous_page_type - Previous page type identifier (optional, set during navigation)
   */
  const previousPageContext = useState<
    Pick<TrackingPageContext, 'previous_page_path' | 'previous_page_type'>
  >('previous-page-context-state', () => ({
    previous_page_path: undefined,
    previous_page_type: undefined,
  }))

  /**
   * Reactive tracking context state for current page.
   * Stores the path and page type of the current page for analytics.
   *
   * @returns current_page_path - Current page URL path (optional, set during navigation)
   * @returns current_page_type - Current page type identifier (optional, set during navigation)
   */
  const currentPageContext = useState<
    Pick<TrackingPageContext, 'current_page_path' | 'current_page_type'>
  >('current-page-context-state', () => ({
    current_page_path: undefined,
    current_page_type: undefined,
  }))

  /**
   * Reactive tracking context state for initial page.
   * Stores the absolute URL of the first page visited in the current session for analytics.
   *
   * @returns initialPage - Absolute URL of the first page visited in the current session
   */
  const initialPage = useState('initial-page', () => '')

  /**
   * Updates the previous page context for navigation tracking.
   * Stores the path and page type of the previous page for analytics.
   *
   * @param pagePath URL path of the previous page
   * @param pageType Page type identifier (e.g., 'pdp', 'plp', 'basket') from route meta
   */
  const setPreviousPageContext = (pagePath: string, pageType: PageType) => {
    previousPageContext.value.previous_page_path = pagePath
    previousPageContext.value.previous_page_type = pageType
  }

  /**
   * Updates the current page context for navigation tracking.
   * Stores the path and page type of the current page for analytics.
   *
   * @param pagePath URL path of the current page
   * @param pageType Page type identifier (e.g., 'pdp', 'plp', 'basket') from route meta
   */
  const setCurrentPageContext = (pagePath: string, pageType: PageType) => {
    currentPageContext.value.current_page_path = pagePath
    currentPageContext.value.current_page_type = pageType
  }

  /**
   * Updates the landing page URL for session tracking.
   * Sets the first page visited in the current session for analytics.
   *
   * @param pagePath Absolute URL of the landing page (typically `window.location.href`)
   */
  const setInitialPage = (pagePath: string) => {
    initialPage.value = pagePath
  }

  return {
    previousPageContext,
    currentPageContext,
    initialPage,
    setPreviousPageContext,
    setCurrentPageContext,
    setInitialPage,
  }
}

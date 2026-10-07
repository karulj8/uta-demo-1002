import { useGlobalEvents } from '../composables/useGlobalEvents'
import { defineNuxtRouteMiddleware } from '#app'

/**
 * Middleware for tracking content view events on route navigation.
 *
 * This middleware tracks content view events when users navigate between
 * different pages in the application. It automatically sends `content_view`
 * events to GTM with page context information (URL, title, referrer) for
 * each route change.
 *
 * The middleware skips tracking in the following cases:
 * - Initial page load (tracked by the GTM plugin on `page:loading:end` hook)
 * - Route changes where the path hasn't changed (e.g., query parameter changes)
 *
 * Used as a Nuxt route middleware to automatically track page views for
 * analytics and user behavior analysis.
 *
 * @param to Target route object containing destination route information
 * @param from Source route object containing previous route information
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // If the page is loaded for the first time, we don't need to track it
  // The initial page is tracked by the `gtm.client.ts` plugin on the `page:loading:end` hook
  if (to.path === from.path) {
    return
  }

  const { trackContentView } = useGlobalEvents()

  trackContentView()
})

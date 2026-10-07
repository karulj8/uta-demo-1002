import { useRuntimeConfig } from 'nuxt/app'
import type { TrackingEvent } from '../types/tracking'
import { useTrackingContext } from './useTrackingContext'
import { useLog } from '#storefront/composables'
import { useScriptGoogleTagManager } from '#imports'

/**
 * Provides a composable for managing tracking events with GTM.
 *
 * Uses useGtm composable to get the GTM instance and push the tracking event to the dataLayer.
 * The provided data is merged with the page and session context.
 * If the GTM instance is not available (on server side or not initialized), the event is not pushed.
 *
 * @returns An object with `push` function.
 *
 * @example
 * ```ts
 * const { push } = useTracking()
 *
 * push({
 *   event: 'content_view',
 *   page: { interaction_source: 'button' },
 *   ecommerce: { items: [{ item_id: '123' }] },
 * })
 * ```
 */
export function useTracking() {
  const {
    public: { tracking },
  } = useRuntimeConfig()
  const tagManager = useScriptGoogleTagManager({
    ...tracking.gtm,
  })

  const { session, page } = useTrackingContext()
  const log = useLog('useTracking')

  /**
   * Pushes a tracking event to the GTM dataLayer with merged context data.
   *
   * This function merges the provided tracking event data with the current page
   * and session context from `useTrackingContext`. The event is automatically
   * enriched with page information (URL, title, referrer) and session data
   * (user ID, shop ID, locale) before being sent to GTM.
   *
   * If the event includes ecommerce data, the previous ecommerce object in the
   * dataLayer is cleared first to prevent data pollution between events.
   *
   * The function returns early and does not push the event if:
   * - Running on the server-side (SSR)
   * - GTM instance is not available or not initialized
   *
   * @param data Partial tracking event data to push. Can include event name,
   * page-specific data, ecommerce data, and custom properties. The page and
   * session context are automatically merged with the provided data.
   */
  const push = (data: Partial<TrackingEvent>) => {
    if (import.meta.server) {
      log.debug('Tracking is not available on the server')
      return
    }

    if ('ecommerce' in data) {
      tagManager.proxy.dataLayer.push({ ecommerce: null }) // Clear the previous ecommerce object
    }

    tagManager.proxy.dataLayer.push({
      ...data,
      page: {
        ...page.value,
        interaction_source: data.page?.interaction_source,
      },
      session: session.value,
    })
  }

  return { push }
}

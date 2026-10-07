import type { TrackingEvent } from '../types/tracking'
import { useTracking } from './useTracking'
import { useLog } from '#storefront/composables'

/**
 * This composable is used to track the global events.
 *
 * @returns The functions to track the global events.
 */
export function useGlobalEvents() {
  const { push } = useTracking()
  const log = useLog('useGlobalEvents')
  /**
   * Tracks the content view event.
   * Sends an event with the content view data.
   *
   * @param data - The data of the content view.
   *
   * @example
   * ```ts
   * const { trackContentView, trackShopInitialization, trackError, trackShopSwitch } = useGlobalEvents()
   *
   * trackContentView({
   *   page: { interaction_source: 'country_detection_modal' },
   *   custom_property: 'custom_value',
   * })
   *
   * trackShopInitialization()
   *
   * trackError({
   *   code: 500,
   *   message: 'Internal server error',
   * })
   *
   * trackShopSwitch()
   * ```
   */
  const trackContentView = (data?: Partial<TrackingEvent>) => {
    if (import.meta.server) {
      log.debug('`trackContentView` is not available on the server')
      return
    }

    push({
      event: 'content_view',
      ...data,
    })
  }

  /**
   * Tracks the shop initialization event.
   *
   * @returns void
   */
  const trackShopInitialization = () => {
    if (import.meta.server) {
      log.debug('`trackShopInitialization` is not available on the server')
      return
    }

    push({
      event: 'shop_init',
    })
  }

  /**
   * Tracks the error event.
   * Sends an event with the error data.
   *
   * @param data - The data of the error.
   * @param code - The code of the error.
   * @param message - The message of the error.
   *
   * @returns void
   */
  const trackError = ({
    code,
    message,
  }: {
    code?: number
    message: string
  }) => {
    if (import.meta.server) {
      log.debug('`trackError` is not available on the server')
      return
    }

    push({
      event: 'error',
      type: [code, message].join('|'),
    })
  }

  /**
   * Tracks the shop switch event.
   *
   * @returns void
   */
  const trackShopSwitch = () => {
    if (import.meta.server) {
      log.debug('`trackShopSwitch` is not available on the server')
      return
    }

    push({
      event: 'shop_change',
    })
  }

  return {
    trackContentView,
    trackShopInitialization,
    trackError,
    trackShopSwitch,
  }
}

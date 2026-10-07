import { useTracking } from './useTracking'
import { useLog } from '#storefront/composables'

/**
 * Provides tracking functions for authentication-related events.
 * Used in authentication composables and sign-in pages to track user authentication actions.
 *
 * @returns Object with tracking functions for sign-up, login, and logout events.
 *
 * @example
 * ```ts
 * // Used in authentication composable
 * const { trackLogin, trackSignUp, trackLogout } = useSignInEvents()
 *
 * // Track successful login
 * trackLogin(true)
 *
 * // Track failed sign-up
 * trackSignUp(false)
 *
 * // Track logout
 * trackLogout()
 * ```
 */
export function useSignInEvents() {
  const { push } = useTracking()
  const log = useLog('useSignInEvents')

  /**
   * Tracks user sign-up events with success or error status.
   * Used in registration flows to monitor sign-up completion and failures.
   *
   * @param successful Whether the sign-up attempt was successful (defaults to `false` if not provided)
   */
  const trackSignUp = (successful: boolean) => {
    if (import.meta.server) {
      log.debug('`trackSignUp` is not available on the server')
      return
    }

    push({
      event: 'sign_up',
      status: successful ? 'successful' : 'error',
    })
  }

  /**
   * Tracks user login events with success or error status.
   * Used in authentication flows to monitor login attempts and failures.
   *
   * @param successful Whether the login attempt was successful (defaults to `false` if not provided)
   */
  const trackLogin = (successful: boolean) => {
    if (import.meta.server) {
      log.debug('`trackLogin` is not available on the server')
      return
    }

    push({
      event: 'login',
      status: successful ? 'successful' : 'error',
    })
  }

  /**
   * Tracks user logout events.
   * Used when users sign out to record logout actions in analytics.
   */
  const trackLogout = () => {
    if (import.meta.server) {
      log.debug('`trackLogout` is not available on the server')
      return
    }

    push({
      event: 'logout',
    })
  }

  return {
    trackLogin,
    trackLogout,
    trackSignUp,
  }
}

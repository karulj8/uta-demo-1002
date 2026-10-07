/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type { Scayle } from '@scayle/checkout-types'

declare global {
  /**
   * Extends the global Window interface to include the `scayle` object.
   * The checkout web component script (loaded via `useScript` in `useCheckoutWebComponent`)
   * attaches the SCAYLE Checkout API to `window.scayle`, providing access to authentication
   * and checkout functionality (e.g., `window.scayle.auth.V3`).
   * Used in checkout-related composables and components to interact with the SCAYLE Checkout SDK.
   */
  interface Window {
    scayle: Scayle
  }

  /**
   * Extends the global WindowEventMap to include custom events dispatched by the checkout web component.
   * These events are fired by the SCAYLE Checkout SDK when different parts of the authentication system are ready.
   * Used with `useEventListener` from VueUse to react to checkout lifecycle events.
   */
  interface WindowEventMap {
    /**
     * Fired when the authentication API is ready to use.
     * Used in `useCheckoutWebComponent` to initialize the auth API after the checkout script loads.
     * The SCAYLE Checkout Web Component dispatches this event on the window when `window.scayle.auth.V3` becomes available.
     */
    'scayle.auth.ready': void
  }
}

export {}

import '@scayle/storefront-nuxt'

/**
 * Delivery cost configuration with display value and disclaimer text.
 * Configured in SCAYLE Panel and displayed in basket summary.
 */
export type DeliveryCosts = {
  /** Display value for delivery costs (e.g., "from €4.99") */
  value: string
  /** Disclaimer or additional information about delivery */
  disclaimer: string
}

// Extends SCAYLE shop configuration with delivery cost data.
declare module '@scayle/storefront-nuxt' {
  /** Custom data for shop country configuration. */
  interface ShopCountryCustomData {
    /** Optional delivery cost configuration */
    deliveryCosts?: DeliveryCosts
  }
}

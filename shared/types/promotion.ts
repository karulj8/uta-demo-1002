import type { CentAmount } from '@scayle/storefront-nuxt'
import type { PromotionStyle } from '~/utils/promotion'
import type { RouteLocationAsPathGeneric } from '#vue-router'

// Extends SCAYLE promotion types with custom storefront-specific data.
declare module '@scayle/storefront-nuxt' {
  /** Custom data structure for promotions configured in SCAYLE Panel. */
  interface PromotionCustomData {
    /** Product badge configuration with attribute ID and label */
    product?: {
      attributeId: number
      attributeGroupId: number
      badgeLabel: string
    }
    /** Secondary text displayed below the headline */
    subline?: string
    /** Terms and conditions text for the promotion */
    conditions?: string
    /** Minimum order value required for promotion eligibility */
    minimumOrderValue?: CentAmount
    /** Custom color scheme for promotion display */
    color?: {
      background: string
      text: string
    }
    /** Whether to hide the countdown timer */
    hideCountdown?: boolean
    /** Link URL or route for the promotion */
    link?: string
  }
}

/**
 * Normalized display data for promotions and campaigns.
 * Used in deal ribbons, banners, and badges throughout the Storefront Application.
 */
export interface DealDisplayData {
  /** Unique identifier */
  id: string
  /** Internal name */
  name: string
  /** Display headline shown to users */
  headline?: string
  /** Secondary text shown below headline */
  subline?: string
  /** Navigation target when clicking the promotion */
  link?: string | RouteLocationAsPathGeneric
  /** Color styling (background, text, border colors) */
  colorStyle: PromotionStyle
  /** Terms and conditions text */
  conditions?: string
  /** Whether to hide countdown timer */
  hideCountdown: boolean
  /** Expiration date in RFC3339 format */
  expirationDate?: string | null
}

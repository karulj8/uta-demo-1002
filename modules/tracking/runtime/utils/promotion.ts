import type { Campaign, Promotion } from '@scayle/storefront-nuxt'
import type { TrackingEcommerceItem } from '../types'

/**
 * Maps a promotion to an ecommerce item.
 *
 * @param promotion - The promotion to map.
 * @returns The ecommerce item.
 */
export const mapPromotionToEcommerceItem = (
  promotion: Promotion,
): TrackingEcommerceItem => {
  return {
    promotion_id: promotion.id.toString(),
    promotion_name: promotion.name,
    promotion_display_name: promotion.displayName || undefined,
    promotion_link: promotion.customData.link,
  }
}

/**
 * Maps a campaign to an ecommerce item.
 *
 * @param campaign - The campaign to map.
 * @returns The ecommerce item.
 */
export const mapCampaignToEcommerceItem = (
  campaign: Campaign,
): TrackingEcommerceItem => {
  return {
    promotion_id: campaign.id.toString(),
    promotion_name: campaign.name,
    promotion_display_name: campaign.name,
    promotion_link: campaign.link,
  }
}

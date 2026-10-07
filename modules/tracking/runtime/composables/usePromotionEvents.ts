import type { Campaign, Promotion } from '@scayle/storefront-nuxt'
import {
  mapPromotionToEcommerceItem,
  mapCampaignToEcommerceItem,
} from '../utils/promotion'
import { useTracking } from './useTracking'
import { useLog } from '#storefront/composables'

/**
 * This composable is used to track the promotion events.
 *
 * @returns The functions to track the promotion events.
 *
 * @example
 * ```ts
 * const { trackViewPromotion, trackViewCampaign, trackSelectPromotion, trackSelectCampaign } = usePromotionEvents()
 *
 * trackViewPromotion(promotions)
 * trackViewCampaign(campaign)
 * trackSelectPromotion(promotion)
 * trackSelectCampaign(campaign)
 * ```
 */
export function usePromotionEvents() {
  const { push } = useTracking()
  const log = useLog('usePromotionEvents')

  /**
   * Tracks the view promotion event.
   * Sends an event with the promotion data.
   *
   * @param promotions - The promotions to track.
   *
   * @returns void
   */
  const trackViewPromotion = (promotions: Promotion[]) => {
    if (import.meta.server) {
      log.debug('`trackViewPromotion` is not available on the server')
      return
    }

    push({
      event: 'view_promotion',
      ecommerce: { items: promotions.map(mapPromotionToEcommerceItem) },
    })
  }

  /**
   * Tracks the view campaign event.
   * Sends an event with the campaign data.
   *
   * @param campaign - The campaign to track.
   *
   * @returns void
   */
  const trackViewCampaign = (campaign: Campaign) => {
    if (import.meta.server) {
      log.debug('`trackViewCampaign` is not available on the server')
      return
    }

    push({
      event: 'view_promotion',
      ecommerce: { items: [mapCampaignToEcommerceItem(campaign)] },
    })
  }

  /**
   * Tracks the select promotion event.
   * Sends an event with the promotion data.
   *
   * @param promotion - The promotion to track.
   *
   * @returns void
   */
  const trackSelectPromotion = (promotion: Promotion) => {
    if (import.meta.server) {
      log.debug('`trackSelectPromotion` is not available on the server')
      return
    }

    push({
      event: 'select_promotion',
      ecommerce: { items: [mapPromotionToEcommerceItem(promotion)] },
    })
  }

  /**
   * Tracks the select campaign event.
   * Sends an event with the campaign data.
   *
   * @param campaign - The campaign to track.
   *
   * @returns void
   */
  const trackSelectCampaign = (campaign: Campaign) => {
    if (import.meta.server) {
      log.debug('`trackSelectCampaign` is not available on the server')
      return
    }

    push({
      event: 'select_promotion',
      ecommerce: { items: [mapCampaignToEcommerceItem(campaign)] },
    })
  }

  return {
    trackViewPromotion,
    trackViewCampaign,
    trackSelectPromotion,
    trackSelectCampaign,
  }
}

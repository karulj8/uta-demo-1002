import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Campaign, Promotion } from '@scayle/storefront-nuxt'
import { automaticDiscountPromotionFactory } from '@scayle/storefront-nuxt/test/factories'
import { usePromotionEvents } from './usePromotionEvents'

const mocks = vi.hoisted(() => {
  return {
    push: vi.fn(),
  }
})

vi.mock('./useTracking', () => ({
  useTracking: vi.fn(() => ({
    push: mocks.push,
  })),
}))

vi.mock('@scayle/storefront-nuxt/composables', () => ({
  useLog: vi.fn(() => console),
}))

describe('usePromotionEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('trackViewPromotion', () => {
    it('should track view promotion event with multiple promotions', () => {
      const { trackViewPromotion } = usePromotionEvents()

      const promotions: Promotion[] = [
        automaticDiscountPromotionFactory.build({
          id: '111',
          name: 'Promotion 1',
          displayName: 'Promotion One',
          customData: {
            link: '/promotions/1',
          },
        }),
        automaticDiscountPromotionFactory.build({
          id: '222',
          name: 'Promotion 2',
          displayName: 'Promotion Two',
          customData: {
            link: '/promotions/2',
          },
        }),
      ]

      trackViewPromotion(promotions)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'view_promotion',
        ecommerce: {
          items: [
            {
              promotion_id: '111',
              promotion_name: 'Promotion 1',
              promotion_display_name: 'Promotion One',
              promotion_link: '/promotions/1',
            },
            {
              promotion_id: '222',
              promotion_name: 'Promotion 2',
              promotion_display_name: 'Promotion Two',
              promotion_link: '/promotions/2',
            },
          ],
        },
      })
    })

    it('should track view promotion event with empty array', () => {
      const { trackViewPromotion } = usePromotionEvents()

      trackViewPromotion([])

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'view_promotion',
        ecommerce: { items: [] },
      })
    })
  })

  describe('trackViewCampaign', () => {
    it('should track view campaign event', () => {
      const { trackViewCampaign } = usePromotionEvents()

      const campaign: Campaign = {
        id: 123,
        key: 'summer-campaign',
        name: 'Summer Campaign',
        description: 'Summer sale campaign',
        reduction: 20,
        start_at: '2024-06-01T00:00:00Z' as Campaign['start_at'],
        end_at: '2024-08-31T23:59:59Z' as Campaign['end_at'],
        startsAt: '2024-06-01T00:00:00Z' as Campaign['startsAt'],
        endsAt: '2024-08-31T23:59:59Z' as Campaign['endsAt'],
        customData: {},
        headline: 'Summer Sale',
        subline: 'Get 20% off',
        link: '/campaigns/summer',
        colorStyle: 'primary',
        hideCountdown: false,
        color: {
          background: '#000000',
          text: '#ffffff',
        },
        product: {
          attributeId: 1,
          badgeLabel: 'Summer Sale',
        },
        condition: 'true',
      }

      trackViewCampaign(campaign)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'view_promotion',
        ecommerce: {
          items: [
            {
              promotion_id: '123',
              promotion_name: 'Summer Campaign',
              promotion_display_name: 'Summer Campaign',
              promotion_link: '/campaigns/summer',
            },
          ],
        },
      })
    })
  })

  describe('trackSelectPromotion', () => {
    it('should track select promotion event', () => {
      const { trackSelectPromotion } = usePromotionEvents()

      const promotion: Promotion = automaticDiscountPromotionFactory.build({
        id: '333',
        name: 'Selected Promotion',
        displayName: 'Selected Promotion Display',
        customData: {
          link: '/promotions/selected',
        },
      })

      trackSelectPromotion(promotion)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'select_promotion',
        ecommerce: {
          items: [
            {
              promotion_id: '333',
              promotion_name: 'Selected Promotion',
              promotion_display_name: 'Selected Promotion Display',
              promotion_link: '/promotions/selected',
            },
          ],
        },
      })
    })

    it('should track select promotion event without displayName', () => {
      const { trackSelectPromotion } = usePromotionEvents()

      const promotion: Promotion = automaticDiscountPromotionFactory.build({
        id: '444',
        name: 'Promotion Without Display',
        displayName: undefined,
        customData: {
          link: '/promotions/no-display',
        },
      })

      trackSelectPromotion(promotion)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'select_promotion',
        ecommerce: {
          items: [
            {
              promotion_id: '444',
              promotion_name: 'Promotion Without Display',
              promotion_display_name: undefined,
              promotion_link: '/promotions/no-display',
            },
          ],
        },
      })
    })
  })

  describe('trackSelectCampaign', () => {
    it('should track select campaign event', () => {
      const { trackSelectCampaign } = usePromotionEvents()

      const campaign: Campaign = {
        id: 456,
        key: 'winter-campaign',
        name: 'Winter Campaign',
        description: 'Winter sale campaign',
        reduction: 30,
        start_at: '2024-12-01T00:00:00Z' as Campaign['start_at'],
        end_at: '2025-02-28T23:59:59Z' as Campaign['end_at'],
        startsAt: '2024-12-01T00:00:00Z' as Campaign['startsAt'],
        endsAt: '2025-02-28T23:59:59Z' as Campaign['endsAt'],
        customData: {},
        headline: 'Winter Sale',
        subline: 'Get 30% off',
        link: '/campaigns/winter',
        colorStyle: 'secondary',
        hideCountdown: true,
        color: {
          background: '#ffffff',
          text: '#000000',
        },
        product: {
          attributeId: 2,
          badgeLabel: 'Winter Sale',
        },
        condition: 'true',
      }

      trackSelectCampaign(campaign)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'select_promotion',
        ecommerce: {
          items: [
            {
              promotion_id: '456',
              promotion_name: 'Winter Campaign',
              promotion_display_name: 'Winter Campaign',
              promotion_link: '/campaigns/winter',
            },
          ],
        },
      })
    })
  })
})

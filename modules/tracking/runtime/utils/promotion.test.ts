import { describe, it, expect } from 'vitest'
import type { Promotion, Campaign } from '@scayle/storefront-nuxt'
import { automaticDiscountPromotionFactory } from '@scayle/storefront-nuxt/test/factories'
import {
  mapPromotionToEcommerceItem,
  mapCampaignToEcommerceItem,
} from './promotion'

describe('mapPromotionToEcommerceItem', () => {
  it('should map promotion to ecommerce item with all fields', () => {
    const promotion: Promotion = automaticDiscountPromotionFactory.build({
      id: '123',
      name: 'Summer Sale',
      displayName: 'Summer Sale 2024',
      customData: {
        link: '/promotions/summer-sale',
      },
    })

    const result = mapPromotionToEcommerceItem(promotion)

    expect(result).toEqual({
      promotion_id: '123',
      promotion_name: 'Summer Sale',
      promotion_display_name: 'Summer Sale 2024',
      promotion_link: '/promotions/summer-sale',
    })
  })

  it('should map promotion without displayName', () => {
    const promotion: Promotion = automaticDiscountPromotionFactory.build({
      id: '456',
      name: 'Winter Sale',
      displayName: undefined,
      customData: {
        link: '/promotions/winter-sale',
      },
    })

    const result = mapPromotionToEcommerceItem(promotion)

    expect(result).toEqual({
      promotion_id: '456',
      promotion_name: 'Winter Sale',
      promotion_display_name: undefined,
      promotion_link: '/promotions/winter-sale',
    })
  })

  it('should handle promotion with empty customData link', () => {
    const promotion: Promotion = automaticDiscountPromotionFactory.build({
      id: '789',
      name: 'Spring Sale',
      customData: {
        link: '',
      },
    })

    const result = mapPromotionToEcommerceItem(promotion)

    expect(result).toEqual({
      promotion_id: '789',
      promotion_name: 'Spring Sale',
      promotion_display_name: undefined,
      promotion_link: '',
    })
  })
})

describe('mapCampaignToEcommerceItem', () => {
  it('should map campaign to ecommerce item', () => {
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

    const result = mapCampaignToEcommerceItem(campaign)

    expect(result).toEqual({
      promotion_id: '123',
      promotion_name: 'Summer Campaign',
      promotion_display_name: 'Summer Campaign',
      promotion_link: '/campaigns/summer',
    })
  })

  it('should handle campaign with different id', () => {
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

    const result = mapCampaignToEcommerceItem(campaign)

    expect(result).toEqual({
      promotion_id: '456',
      promotion_name: 'Winter Campaign',
      promotion_display_name: 'Winter Campaign',
      promotion_link: '/campaigns/winter',
    })
  })
})

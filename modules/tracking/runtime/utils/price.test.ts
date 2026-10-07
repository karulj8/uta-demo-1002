import { describe, it, expect } from 'vitest'
import type {
  AppliedReduction,
  CentAmount,
  Price,
} from '@scayle/storefront-nuxt'
import {
  getSalePriceFromAppliedReductions,
  getCampaignPriceFromAppliedReductions,
  getPromotionPriceFromAppliedReductions,
  getEcommercePrice,
} from './price'

describe('getSalePriceFromAppliedReductions', () => {
  it('should return the sale price when a sale reduction exists', () => {
    const appliedReductions: AppliedReduction[] = [
      {
        category: 'sale',
        type: 'relative',
        amount: {
          relative: 0.1,
          absoluteWithTax: 1000 as CentAmount,
        },
      },
    ]

    const result = getSalePriceFromAppliedReductions(appliedReductions)

    expect(result).toBe(1000)
  })

  it('should return undefined when no sale reduction exists', () => {
    const appliedReductions: AppliedReduction[] = [
      {
        category: 'campaign',
        type: 'relative',
        amount: {
          relative: 0.1,
          absoluteWithTax: 1000 as CentAmount,
        },
      },
      {
        category: 'promotion',
        type: 'relative',
        amount: {
          relative: 0.05,
          absoluteWithTax: 500 as CentAmount,
        },
      },
    ]

    const result = getSalePriceFromAppliedReductions(appliedReductions)

    expect(result).toBeUndefined()
  })

  it('should return undefined when the array is empty', () => {
    const appliedReductions: AppliedReduction[] = []

    const result = getSalePriceFromAppliedReductions(appliedReductions)

    expect(result).toBeUndefined()
  })

  it('should return the first sale price when multiple sale reductions exist', () => {
    const appliedReductions: AppliedReduction[] = [
      {
        category: 'sale',
        type: 'relative',
        amount: {
          relative: 0.1,
          absoluteWithTax: 1000 as CentAmount,
        },
      },
      {
        category: 'sale',
        type: 'absolute',
        amount: {
          relative: 0.15,
          absoluteWithTax: 1500 as CentAmount,
        },
      },
    ]

    const result = getSalePriceFromAppliedReductions(appliedReductions)

    expect(result).toBe(1000)
  })

  it('should return the sale price when mixed with other reduction categories', () => {
    const appliedReductions: AppliedReduction[] = [
      {
        category: 'campaign',
        type: 'relative',
        amount: {
          relative: 0.1,
          absoluteWithTax: 1000 as CentAmount,
        },
      },
      {
        category: 'sale',
        type: 'relative',
        amount: {
          relative: 0.2,
          absoluteWithTax: 2000 as CentAmount,
        },
      },
      {
        category: 'promotion',
        type: 'relative',
        amount: {
          relative: 0.05,
          absoluteWithTax: 500 as CentAmount,
        },
      },
    ]

    const result = getSalePriceFromAppliedReductions(appliedReductions)

    expect(result).toBe(2000)
  })
})

describe('getCampaignPriceFromAppliedReductions', () => {
  it('should return the campaign price when a campaign reduction exists', () => {
    const appliedReductions: AppliedReduction[] = [
      {
        category: 'campaign',
        type: 'relative',
        amount: {
          relative: 0.1,
          absoluteWithTax: 1000 as CentAmount,
        },
      },
    ]

    const result = getCampaignPriceFromAppliedReductions(appliedReductions)

    expect(result).toBe(1000)
  })

  it('should return undefined when no campaign reduction exists', () => {
    const appliedReductions: AppliedReduction[] = [
      {
        category: 'sale',
        type: 'relative',
        amount: {
          relative: 0.1,
          absoluteWithTax: 1000 as CentAmount,
        },
      },
      {
        category: 'promotion',
        type: 'relative',
        amount: {
          relative: 0.05,
          absoluteWithTax: 500 as CentAmount,
        },
      },
    ]

    const result = getCampaignPriceFromAppliedReductions(appliedReductions)

    expect(result).toBeUndefined()
  })

  it('should return undefined when the array is empty', () => {
    const appliedReductions: AppliedReduction[] = []

    const result = getCampaignPriceFromAppliedReductions(appliedReductions)

    expect(result).toBeUndefined()
  })

  it('should return the first campaign price when multiple campaign reductions exist', () => {
    const appliedReductions: AppliedReduction[] = [
      {
        category: 'campaign',
        type: 'relative',
        amount: {
          relative: 0.1,
          absoluteWithTax: 1000 as CentAmount,
        },
      },
      {
        category: 'campaign',
        type: 'absolute',
        amount: {
          relative: 0.15,
          absoluteWithTax: 1500 as CentAmount,
        },
      },
    ]

    const result = getCampaignPriceFromAppliedReductions(appliedReductions)

    expect(result).toBe(1000)
  })

  it('should return the campaign price when mixed with other reduction categories', () => {
    const appliedReductions: AppliedReduction[] = [
      {
        category: 'sale',
        type: 'relative',
        amount: {
          relative: 0.1,
          absoluteWithTax: 1000 as CentAmount,
        },
      },
      {
        category: 'campaign',
        type: 'relative',
        amount: {
          relative: 0.2,
          absoluteWithTax: 2000 as CentAmount,
        },
      },
      {
        category: 'promotion',
        type: 'relative',
        amount: {
          relative: 0.05,
          absoluteWithTax: 500 as CentAmount,
        },
      },
    ]

    const result = getCampaignPriceFromAppliedReductions(appliedReductions)

    expect(result).toBe(2000)
  })
})

describe('getPromotionPriceFromAppliedReductions', () => {
  it('should return the promotion price when a promotion reduction exists', () => {
    const appliedReductions: AppliedReduction[] = [
      {
        category: 'promotion',
        type: 'relative',
        amount: {
          relative: 0.1,
          absoluteWithTax: 1000 as CentAmount,
        },
      },
    ]

    const result = getPromotionPriceFromAppliedReductions(appliedReductions)

    expect(result).toBe(1000)
  })

  it('should return undefined when no promotion reduction exists', () => {
    const appliedReductions: AppliedReduction[] = [
      {
        category: 'sale',
        type: 'relative',
        amount: {
          relative: 0.1,
          absoluteWithTax: 1000 as CentAmount,
        },
      },
      {
        category: 'campaign',
        type: 'relative',
        amount: {
          relative: 0.05,
          absoluteWithTax: 500 as CentAmount,
        },
      },
    ]

    const result = getPromotionPriceFromAppliedReductions(appliedReductions)

    expect(result).toBeUndefined()
  })

  it('should return undefined when the array is empty', () => {
    const appliedReductions: AppliedReduction[] = []

    const result = getPromotionPriceFromAppliedReductions(appliedReductions)

    expect(result).toBeUndefined()
  })

  it('should return the first promotion price when multiple promotion reductions exist', () => {
    const appliedReductions: AppliedReduction[] = [
      {
        category: 'promotion',
        type: 'relative',
        amount: {
          relative: 0.1,
          absoluteWithTax: 1000 as CentAmount,
        },
      },
      {
        category: 'promotion',
        type: 'absolute',
        amount: {
          relative: 0.15,
          absoluteWithTax: 1500 as CentAmount,
        },
      },
    ]

    const result = getPromotionPriceFromAppliedReductions(appliedReductions)

    expect(result).toBe(1000)
  })

  it('should return the promotion price when mixed with other reduction categories', () => {
    const appliedReductions: AppliedReduction[] = [
      {
        category: 'sale',
        type: 'relative',
        amount: {
          relative: 0.1,
          absoluteWithTax: 1000 as CentAmount,
        },
      },
      {
        category: 'campaign',
        type: 'relative',
        amount: {
          relative: 0.2,
          absoluteWithTax: 2000 as CentAmount,
        },
      },
      {
        category: 'promotion',
        type: 'relative',
        amount: {
          relative: 0.05,
          absoluteWithTax: 500 as CentAmount,
        },
      },
    ]

    const result = getPromotionPriceFromAppliedReductions(appliedReductions)

    expect(result).toBe(500)
  })

  it('should handle promotion reductions with promotionId', () => {
    const appliedReductions: AppliedReduction[] = [
      {
        category: 'promotion',
        type: 'relative',
        amount: {
          relative: 0.1,
          absoluteWithTax: 1000 as CentAmount,
        },
        promotionId: 'promo-123',
      },
    ]

    const result = getPromotionPriceFromAppliedReductions(appliedReductions)

    expect(result).toBe(1000)
  })
})

describe('getEcommercePrice', () => {
  it('should return the price with reduction subtracted when appliedReductions exist', () => {
    const price = {
      withTax: 1500 as CentAmount,
      appliedReductions: [
        {
          category: 'sale',
          type: 'relative',
          amount: {
            relative: 0.1,
            absoluteWithTax: 100 as CentAmount,
          },
        },
      ],
    } as Price

    const result = getEcommercePrice(price)

    expect(result).toEqual({
      campaign_discount_with_tax: undefined,
      currency: undefined,
      original_price_with_tax: 16,
      price_with_tax: 15,
      promotion_discount_with_tax: undefined,
      sale_discount_with_tax: 1,
      tax: undefined,
    })
  })

  it('should return the full price when appliedReductions array is empty', () => {
    const price = {
      withTax: 2000 as CentAmount,
      appliedReductions: [],
      recommendedRetailPrice: null,
      tax: {
        vat: {
          amount: 100 as CentAmount,
          rate: 0.1,
        },
      },
      currencyCode: 'USD',
      withoutTax: 1000 as CentAmount,
    } as Price

    const result = getEcommercePrice(price)

    expect(result).toEqual({
      campaign_discount_with_tax: undefined,
      currency: 'USD',
      original_price_with_tax: 20,
      price_with_tax: 20,
      promotion_discount_with_tax: undefined,
      sale_discount_with_tax: undefined,
      tax: 1,
    })
  })

  it('should return the full price when appliedReductions is undefined', () => {
    const price = {
      withTax: 2500 as CentAmount,
      appliedReductions: undefined,
      currencyCode: 'USD',
      tax: {
        vat: {
          amount: 100 as CentAmount,
          rate: 0.1,
        },
      },
    } as unknown as Price

    const result = getEcommercePrice(price)

    expect(result).toEqual({
      campaign_discount_with_tax: undefined,
      currency: 'USD',
      original_price_with_tax: 25,
      price_with_tax: 25,
      promotion_discount_with_tax: undefined,
      sale_discount_with_tax: undefined,
      tax: 1,
    })
  })
})

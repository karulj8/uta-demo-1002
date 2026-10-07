import { describe, it, expect } from 'vitest'
import type { CentAmount } from '@scayle/storefront-nuxt'
import {
  orderItemFactory,
  orderFactory,
} from '@scayle/storefront-nuxt/test/factories'
import {
  sumPromotionReductionsFromAllOrderItems,
  sumCampaignReductionsFromAllOrderItems,
  sumSaleReductionsFromAllOrderItems,
  getPromotionIdsFromOrder,
} from './order'
import type { OrderItem, Order } from '#shared/types/order'

describe('sumPromotionReductionsFromAllOrderItems', () => {
  it('should return 0 when order items is undefined', () => {
    const result = sumPromotionReductionsFromAllOrderItems(undefined)

    expect(result).toBe(0)
  })

  it('should return 0 when order items is empty', () => {
    const result = sumPromotionReductionsFromAllOrderItems([])

    expect(result).toBe(0)
  })

  it('should sum promotion reductions from a single order item', () => {
    const orderItem = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: [
          {
            category: 'promotion',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 500 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const result = sumPromotionReductionsFromAllOrderItems([orderItem])

    expect(result).toBe(500)
  })

  it('should sum promotion reductions from multiple order items', () => {
    const orderItem1 = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: [
          {
            category: 'promotion',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 500 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const orderItem2 = orderItemFactory.build({
      price: {
        withTax: 4999,
        withoutTax: 4200,
        appliedReductions: [
          {
            category: 'promotion',
            type: 'relative',
            amount: {
              relative: 0.15,
              absoluteWithTax: 750 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const result = sumPromotionReductionsFromAllOrderItems([
      orderItem1,
      orderItem2,
    ])

    expect(result).toBe(1250)
  })

  it('should only sum promotion reductions and ignore other categories', () => {
    const orderItem = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: [
          {
            category: 'sale',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 200 as CentAmount,
            },
          },
          {
            category: 'campaign',
            type: 'relative',
            amount: {
              relative: 0.05,
              absoluteWithTax: 300 as CentAmount,
            },
          },
          {
            category: 'promotion',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 500 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const result = sumPromotionReductionsFromAllOrderItems([orderItem])

    expect(result).toBe(500)
  })

  it('should handle multiple promotion reductions in a single item', () => {
    const orderItem = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: [
          {
            category: 'promotion',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 500 as CentAmount,
            },
          },
          {
            category: 'promotion',
            type: 'absolute',
            amount: {
              relative: 0.05,
              absoluteWithTax: 300 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const result = sumPromotionReductionsFromAllOrderItems([orderItem])

    expect(result).toBe(800)
  })

  it('should return 0 when no promotion reductions exist', () => {
    const orderItem = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: [
          {
            category: 'sale',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 200 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const result = sumPromotionReductionsFromAllOrderItems([orderItem])

    expect(result).toBe(0)
  })

  it('should handle order items with undefined appliedReductions', () => {
    const orderItem = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: undefined,
      },
    }) as unknown as OrderItem

    const result = sumPromotionReductionsFromAllOrderItems([orderItem])

    expect(result).toBe(0)
  })
})

describe('sumCampaignReductionsFromAllOrderItems', () => {
  it('should return 0 when order items is undefined', () => {
    const result = sumCampaignReductionsFromAllOrderItems(undefined)

    expect(result).toBe(0)
  })

  it('should return 0 when order items is empty', () => {
    const result = sumCampaignReductionsFromAllOrderItems([])

    expect(result).toBe(0)
  })

  it('should sum campaign reductions from a single order item', () => {
    const orderItem = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: [
          {
            category: 'campaign',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 300 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const result = sumCampaignReductionsFromAllOrderItems([orderItem])

    expect(result).toBe(300)
  })

  it('should sum campaign reductions from multiple order items', () => {
    const orderItem1 = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: [
          {
            category: 'campaign',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 300 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const orderItem2 = orderItemFactory.build({
      price: {
        withTax: 4999,
        withoutTax: 4200,
        appliedReductions: [
          {
            category: 'campaign',
            type: 'relative',
            amount: {
              relative: 0.15,
              absoluteWithTax: 750 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const result = sumCampaignReductionsFromAllOrderItems([
      orderItem1,
      orderItem2,
    ])

    expect(result).toBe(1050)
  })

  it('should only sum campaign reductions and ignore other categories', () => {
    const orderItem = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: [
          {
            category: 'sale',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 200 as CentAmount,
            },
          },
          {
            category: 'campaign',
            type: 'relative',
            amount: {
              relative: 0.05,
              absoluteWithTax: 300 as CentAmount,
            },
          },
          {
            category: 'promotion',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 500 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const result = sumCampaignReductionsFromAllOrderItems([orderItem])

    expect(result).toBe(300)
  })

  it('should handle multiple campaign reductions in a single item', () => {
    const orderItem = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: [
          {
            category: 'campaign',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 300 as CentAmount,
            },
          },
          {
            category: 'campaign',
            type: 'absolute',
            amount: {
              relative: 0.05,
              absoluteWithTax: 200 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const result = sumCampaignReductionsFromAllOrderItems([orderItem])

    expect(result).toBe(500)
  })

  it('should return 0 when no campaign reductions exist', () => {
    const orderItem = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: [
          {
            category: 'promotion',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 500 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const result = sumCampaignReductionsFromAllOrderItems([orderItem])

    expect(result).toBe(0)
  })
})

describe('sumSaleReductionsFromAllOrderItems', () => {
  it('should return 0 when order items is undefined', () => {
    const result = sumSaleReductionsFromAllOrderItems(undefined)

    expect(result).toBe(0)
  })

  it('should return 0 when order items is empty', () => {
    const result = sumSaleReductionsFromAllOrderItems([])

    expect(result).toBe(0)
  })

  it('should sum sale reductions from a single order item', () => {
    const orderItem = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: [
          {
            category: 'sale',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 200 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const result = sumSaleReductionsFromAllOrderItems([orderItem])

    expect(result).toBe(200)
  })

  it('should sum sale reductions from multiple order items', () => {
    const orderItem1 = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: [
          {
            category: 'sale',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 200 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const orderItem2 = orderItemFactory.build({
      price: {
        withTax: 4999,
        withoutTax: 4200,
        appliedReductions: [
          {
            category: 'sale',
            type: 'relative',
            amount: {
              relative: 0.15,
              absoluteWithTax: 750 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const result = sumSaleReductionsFromAllOrderItems([orderItem1, orderItem2])

    expect(result).toBe(950)
  })

  it('should only sum sale reductions and ignore other categories', () => {
    const orderItem = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: [
          {
            category: 'sale',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 200 as CentAmount,
            },
          },
          {
            category: 'campaign',
            type: 'relative',
            amount: {
              relative: 0.05,
              absoluteWithTax: 300 as CentAmount,
            },
          },
          {
            category: 'promotion',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 500 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const result = sumSaleReductionsFromAllOrderItems([orderItem])

    expect(result).toBe(200)
  })

  it('should handle multiple sale reductions in a single item', () => {
    const orderItem = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: [
          {
            category: 'sale',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 200 as CentAmount,
            },
          },
          {
            category: 'sale',
            type: 'absolute',
            amount: {
              relative: 0.05,
              absoluteWithTax: 150 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const result = sumSaleReductionsFromAllOrderItems([orderItem])

    expect(result).toBe(350)
  })

  it('should return 0 when no sale reductions exist', () => {
    const orderItem = orderItemFactory.build({
      price: {
        withTax: 2999,
        withoutTax: 2500,
        appliedReductions: [
          {
            category: 'promotion',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax: 500 as CentAmount,
            },
          },
        ],
      },
    }) as unknown as OrderItem

    const result = sumSaleReductionsFromAllOrderItems([orderItem])

    expect(result).toBe(0)
  })
})

describe('getPromotionIdsFromOrder', () => {
  it('should return empty array when order items is undefined', () => {
    const order = orderFactory.build({
      items: undefined,
    }) as unknown as Order

    const result = getPromotionIdsFromOrder(order)

    expect(result).toEqual([])
  })

  it('should return empty array when order items is empty', () => {
    const order = orderFactory.build({
      items: [],
    }) as unknown as Order

    const result = getPromotionIdsFromOrder(order)

    expect(result).toEqual([])
  })

  it('should return empty array when order items have no promotions', () => {
    const orderItem = orderItemFactory.build({
      promotions: undefined,
    })

    const order = orderFactory.build({
      items: [orderItem],
    }) as unknown as Order

    const result = getPromotionIdsFromOrder(order)

    expect(result).toEqual([])
  })

  it('should return empty array when order items have empty promotions array', () => {
    const orderItem = orderItemFactory.build({
      promotions: [],
    })

    const order = orderFactory.build({
      items: [orderItem],
    }) as unknown as Order

    const result = getPromotionIdsFromOrder(order)

    expect(result).toEqual([])
  })

  it('should extract promotion IDs from a single order item with one promotion', () => {
    const orderItem = orderItemFactory.build({
      promotions: [
        {
          id: 'promo-123',
          name: 'Summer Sale',
          version: '1.0',
        },
      ],
    })

    const order = orderFactory.build({
      items: [orderItem],
    }) as unknown as Order

    const result = getPromotionIdsFromOrder(order)

    expect(result).toEqual(['promo-123'])
  })

  it('should extract promotion IDs from a single order item with multiple promotions', () => {
    const orderItem = orderItemFactory.build({
      promotions: [
        {
          id: 'promo-123',
          name: 'Summer Sale',
          version: '1.0',
        },
        {
          id: 'promo-456',
          name: 'Winter Sale',
          version: '1.0',
        },
        {
          id: 'promo-789',
          name: 'Spring Sale',
          version: '1.0',
        },
      ],
    })

    const order = orderFactory.build({
      items: [orderItem],
    }) as unknown as Order

    const result = getPromotionIdsFromOrder(order)

    expect(result).toEqual(['promo-123', 'promo-456', 'promo-789'])
  })

  it('should extract promotion IDs from multiple order items', () => {
    const orderItem1 = orderItemFactory.build({
      promotions: [
        {
          id: 'promo-123',
          name: 'Summer Sale',
          version: '1.0',
        },
        {
          id: 'promo-456',
          name: 'Winter Sale',
          version: '1.0',
        },
      ],
    })

    const orderItem2 = orderItemFactory.build({
      promotions: [
        {
          id: 'promo-789',
          name: 'Spring Sale',
          version: '1.0',
        },
      ],
    })

    const order = orderFactory.build({
      items: [orderItem1, orderItem2],
    }) as unknown as Order

    const result = getPromotionIdsFromOrder(order)

    expect(result).toEqual(['promo-123', 'promo-456', 'promo-789'])
  })

  it('should deduplicate promotion IDs across multiple order items', () => {
    const orderItem1 = orderItemFactory.build({
      promotions: [
        {
          id: 'promo-123',
          name: 'Summer Sale',
          version: '1.0',
        },
        {
          id: 'promo-456',
          name: 'Winter Sale',
          version: '1.0',
        },
      ],
    })

    const orderItem2 = orderItemFactory.build({
      promotions: [
        {
          id: 'promo-123',
          name: 'Summer Sale',
          version: '1.0',
        },
        {
          id: 'promo-789',
          name: 'Spring Sale',
          version: '1.0',
        },
      ],
    })

    const order = orderFactory.build({
      items: [orderItem1, orderItem2],
    }) as unknown as Order

    const result = getPromotionIdsFromOrder(order)

    expect(result).toEqual(['promo-123', 'promo-456', 'promo-789'])
  })

  it('should deduplicate promotion IDs within a single order item', () => {
    const orderItem = orderItemFactory.build({
      promotions: [
        {
          id: 'promo-123',
          name: 'Summer Sale',
          version: '1.0',
        },
        {
          id: 'promo-123',
          name: 'Summer Sale',
          version: '1.0',
        },
        {
          id: 'promo-456',
          name: 'Winter Sale',
          version: '1.0',
        },
      ],
    })

    const order = orderFactory.build({
      items: [orderItem],
    }) as unknown as Order

    const result = getPromotionIdsFromOrder(order)

    expect(result).toEqual(['promo-123', 'promo-456'])
  })
})

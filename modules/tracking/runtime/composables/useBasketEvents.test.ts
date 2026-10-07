import { describe, it, expect, vi, beforeEach } from 'vitest'
import type {
  BasketTotalPrice,
  BasketItem,
  AppliedReduction,
} from '@scayle/storefront-nuxt'
import {
  basketItemFactory,
  productFactory,
  variantFactory,
} from '@scayle/storefront-nuxt/test/factories'
import type { TrackingInteractionSource } from '../types/tracking'
import { useBasketEvents } from './useBasketEvents'

const mocks = vi.hoisted(() => {
  return {
    push: vi.fn(),
    formatCurrency: vi.fn((value: number) => `€${(value / 100).toFixed(2)}`),
  }
})

vi.mock('./useTracking', () => ({
  useTracking: vi.fn(() => ({
    push: mocks.push,
  })),
}))

vi.mock('#storefront/composables', () => ({
  useLog: vi.fn(() => console),
  useFormatHelpers: vi.fn(() => ({
    formatCurrency: mocks.formatCurrency,
  })),
}))

describe('useBasketEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('trackBasket', () => {
    it('should track basket event with all cost reductions', () => {
      const { trackBasket } = useBasketEvents()

      const cost: BasketTotalPrice = {
        recommendedRetailPrice: null,
        withTax: 10000 as BasketTotalPrice['withTax'],
        withoutTax: 8400 as BasketTotalPrice['withoutTax'],
        currencyCode: 'EUR',
        appliedReductions: [
          {
            category: 'campaign',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax:
                1000 as AppliedReduction['amount']['absoluteWithTax'],
            },
          },
          {
            category: 'sale',
            type: 'relative',
            amount: {
              relative: 0.05,
              absoluteWithTax:
                500 as AppliedReduction['amount']['absoluteWithTax'],
            },
          },
          {
            category: 'promotion',
            type: 'relative',
            amount: {
              relative: 0.15,
              absoluteWithTax:
                1500 as AppliedReduction['amount']['absoluteWithTax'],
            },
          },
        ],
        tax: {
          vat: {
            amount: 1600 as AppliedReduction['amount']['absoluteWithTax'],
            rate: 0.19,
          },
        },
      }

      const items: BasketItem[] = [
        basketItemFactory.build({
          product: { id: 1 },
          quantity: 2,
        }),
      ]

      trackBasket(cost, items)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'cart',
        total_campaign_reduction_with_tax: 10.0,
        total_sale_reduction_with_tax: 5.0,
        total_promotion_reduction_with_tax: 15.0,
        total_with_tax: 100.0,
        total_without_tax: 84.0,
        total_tax: 16.0,
        ecommerce: { items: expect.any(Array) },
      })
    })

    it('should track basket event without cost', () => {
      const { trackBasket } = useBasketEvents()

      const items: BasketItem[] = [
        basketItemFactory.build({
          product: { id: 1 },
          quantity: 1,
        }),
      ]

      trackBasket(undefined, items)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'cart',
        total_campaign_reduction_with_tax: undefined,
        total_sale_reduction_with_tax: undefined,
        total_promotion_reduction_with_tax: undefined,
        total_with_tax: undefined,
        total_without_tax: undefined,
        ecommerce: { items: expect.any(Array) },
      })
    })

    it('should track basket event without items', () => {
      const { trackBasket } = useBasketEvents()

      const cost: BasketTotalPrice = {
        recommendedRetailPrice: null,
        withTax: 5000 as BasketTotalPrice['withTax'],
        withoutTax: 4200 as BasketTotalPrice['withoutTax'],
        currencyCode: 'EUR',
        appliedReductions: [],
        tax: {
          vat: {
            amount: 800 as AppliedReduction['amount']['absoluteWithTax'],
            rate: 0.19,
          },
        },
      }

      trackBasket(cost, undefined)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'cart',
        total_campaign_reduction_with_tax: undefined,
        total_sale_reduction_with_tax: undefined,
        total_promotion_reduction_with_tax: undefined,
        total_with_tax: 50.0,
        total_without_tax: 42.0,
        total_tax: 8.0,
        ecommerce: { items: [] },
      })
    })

    it('should track basket event with only campaign reduction', () => {
      const { trackBasket } = useBasketEvents()

      const cost: BasketTotalPrice = {
        recommendedRetailPrice: null,
        withTax: 10000 as BasketTotalPrice['withTax'],
        withoutTax: 8400 as BasketTotalPrice['withoutTax'],
        currencyCode: 'EUR',
        appliedReductions: [
          {
            category: 'campaign',
            type: 'relative',
            amount: {
              relative: 0.1,
              absoluteWithTax:
                1000 as AppliedReduction['amount']['absoluteWithTax'],
            },
          },
        ],
        tax: {
          vat: {
            amount: 1600 as AppliedReduction['amount']['absoluteWithTax'],
            rate: 0.19,
          },
        },
      }

      trackBasket(cost, [])

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'cart',
        total_campaign_reduction_with_tax: 10.0,
        total_sale_reduction_with_tax: undefined,
        total_promotion_reduction_with_tax: undefined,
        total_with_tax: 100.0,
        total_without_tax: 84.0,
        total_tax: 16.0,
        ecommerce: { items: [] },
      })
    })

    it('should track basket event with empty appliedReductions', () => {
      const { trackBasket } = useBasketEvents()

      const cost: BasketTotalPrice = {
        recommendedRetailPrice: null,
        withTax: 5000 as BasketTotalPrice['withTax'],
        withoutTax: 4200 as BasketTotalPrice['withoutTax'],
        currencyCode: 'EUR',
        appliedReductions: [],
        tax: {
          vat: {
            amount: 800 as AppliedReduction['amount']['absoluteWithTax'],
            rate: 0.19,
          },
        },
      }

      trackBasket(cost, [])

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'cart',
        total_campaign_reduction_with_tax: undefined,
        total_sale_reduction_with_tax: undefined,
        total_promotion_reduction_with_tax: undefined,
        total_with_tax: 50.0,
        total_without_tax: 42.0,
        total_tax: 8.0,
        ecommerce: { items: [] },
      })
    })
  })

  describe('trackAddToBasket', () => {
    it('should track add to basket event with variant, product and quantity', () => {
      const { trackAddToBasket } = useBasketEvents()

      const variant = variantFactory.build({ id: 1 })
      const product = productFactory.build({ id: 1 })
      const quantity = 2

      trackAddToBasket(variant, product, quantity)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'add_to_cart',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: variant.id.toString(),
              quantity,
            }),
          ]),
        },
      })
    })

    it('should track add to basket event with default quantity of 1', () => {
      const { trackAddToBasket } = useBasketEvents()

      const variant = variantFactory.build({ id: 2 })
      const product = productFactory.build({ id: 2 })

      trackAddToBasket(variant, product)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'add_to_cart',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: variant.id.toString(),
              quantity: 1,
            }),
          ]),
        },
      })
    })

    it('should track add to basket event with different quantities', () => {
      const { trackAddToBasket } = useBasketEvents()

      const variant = variantFactory.build({ id: 3 })
      const product = productFactory.build({ id: 3 })
      const quantities = [1, 2, 5, 10]

      for (const quantity of quantities) {
        vi.clearAllMocks()
        trackAddToBasket(variant, product, quantity)

        expect(mocks.push).toHaveBeenCalledWith({
          event: 'add_to_cart',
          ecommerce: {
            items: expect.arrayContaining([
              expect.objectContaining({
                item_id: variant.id.toString(),
                quantity,
              }),
            ]),
          },
        })
      }
    })

    it('should track add to basket event with different variant and product combinations', () => {
      const { trackAddToBasket } = useBasketEvents()

      const variant1 = variantFactory.build({ id: 10 })
      const product1 = productFactory.build({ id: 10 })
      const variant2 = variantFactory.build({ id: 20 })
      const product2 = productFactory.build({ id: 20 })

      trackAddToBasket(variant1, product1, 1)
      expect(mocks.push).toHaveBeenCalledWith({
        event: 'add_to_cart',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: variant1.id.toString(),
              quantity: 1,
            }),
          ]),
        },
      })

      vi.clearAllMocks()

      trackAddToBasket(variant2, product2, 3)
      expect(mocks.push).toHaveBeenCalledWith({
        event: 'add_to_cart',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: variant2.id.toString(),
              quantity: 3,
            }),
          ]),
        },
      })
    })
  })

  describe('trackRemoveFromBasket', () => {
    it('should track remove from basket event with basket item', () => {
      const { trackRemoveFromBasket } = useBasketEvents()

      const item = basketItemFactory.build({
        product: { id: 1 },
        quantity: 2,
      })

      trackRemoveFromBasket(item)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'remove_from_cart',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: item.product.id.toString(),
              quantity: item.quantity,
            }),
          ]),
        },
      })
    })

    it('should track remove from basket event with basket item and interactionSource', () => {
      const { trackRemoveFromBasket } = useBasketEvents()

      const item = basketItemFactory.build({
        product: { id: 2 },
        quantity: 1,
      })
      const interactionSource: TrackingInteractionSource = 'basket'

      trackRemoveFromBasket(item, interactionSource)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'remove_from_cart',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: item.product.id.toString(),
              quantity: item.quantity,
            }),
          ]),
        },
        page: { interaction_source: interactionSource },
      })
    })

    it('should track remove from basket event without interactionSource', () => {
      const { trackRemoveFromBasket } = useBasketEvents()

      const item = basketItemFactory.build({
        product: { id: 3 },
        quantity: 3,
      })

      trackRemoveFromBasket(item)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'remove_from_cart',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: item.product.id.toString(),
              quantity: item.quantity,
            }),
          ]),
        },
      })
    })

    it('should track remove from basket event with different basket items', () => {
      const { trackRemoveFromBasket } = useBasketEvents()

      const item1 = basketItemFactory.build({
        product: { id: 10 },
        quantity: 1,
      })
      const item2 = basketItemFactory.build({
        product: { id: 20 },
        quantity: 2,
      })

      trackRemoveFromBasket(item1)
      expect(mocks.push).toHaveBeenCalledWith({
        event: 'remove_from_cart',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: item1.product.id.toString(),
              quantity: item1.quantity,
            }),
          ]),
        },
      })

      vi.clearAllMocks()

      trackRemoveFromBasket(item2)
      expect(mocks.push).toHaveBeenCalledWith({
        event: 'remove_from_cart',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: item2.product.id.toString(),
              quantity: item2.quantity,
            }),
          ]),
        },
      })
    })

    it('should track remove from basket event with different interactionSource values', () => {
      const { trackRemoveFromBasket } = useBasketEvents()

      const item = basketItemFactory.build({
        product: { id: 5 },
        quantity: 1,
      })
      const interactionSources: TrackingInteractionSource[] = [
        'basket',
        'basket_preview_flyout',
      ]

      for (const interactionSource of interactionSources) {
        vi.clearAllMocks()
        trackRemoveFromBasket(item, interactionSource)

        expect(mocks.push).toHaveBeenCalledWith({
          event: 'remove_from_cart',
          ecommerce: {
            items: expect.arrayContaining([
              expect.objectContaining({
                item_id: item.product.id.toString(),
                quantity: item.quantity,
              }),
            ]),
          },
          page: { interaction_source: interactionSource },
        })
      }
    })
  })

  describe('trackViewCart', () => {
    it('should track view cart event with items', () => {
      const { trackViewCart } = useBasketEvents()

      const items: BasketItem[] = [
        basketItemFactory.build({
          product: { id: 1 },
          quantity: 2,
        }),
        basketItemFactory.build({
          product: { id: 2 },
          quantity: 1,
        }),
      ]

      trackViewCart(items)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'view_cart',
        ecommerce: { items: expect.any(Array) },
      })
    })

    it('should track view cart event with empty array', () => {
      const { trackViewCart } = useBasketEvents()

      trackViewCart([])

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'view_cart',
        ecommerce: { items: [] },
      })
    })

    it('should track view cart event with undefined items', () => {
      const { trackViewCart } = useBasketEvents()

      trackViewCart(undefined)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'view_cart',
        ecommerce: { items: [] },
      })
    })

    it('should track view cart event with single item', () => {
      const { trackViewCart } = useBasketEvents()

      const items: BasketItem[] = [
        basketItemFactory.build({
          product: { id: 3 },
          quantity: 1,
        }),
      ]

      trackViewCart(items)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'view_cart',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: items[0]?.product.id.toString(),
              quantity: items[0]?.quantity,
            }),
          ]),
        },
      })
    })

    it('should track view cart event with multiple items', () => {
      const { trackViewCart } = useBasketEvents()

      const items: BasketItem[] = [
        basketItemFactory.build({
          product: { id: 10 },
          quantity: 2,
        }),
        basketItemFactory.build({
          product: { id: 20 },
          quantity: 3,
        }),
        basketItemFactory.build({
          product: { id: 30 },
          quantity: 1,
        }),
      ]

      trackViewCart(items)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'view_cart',
        ecommerce: { items: expect.any(Array) },
      })
      expect(mocks.push).toHaveBeenCalledTimes(1)
    })
  })
})

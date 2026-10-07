import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CentAmount } from '@scayle/storefront-nuxt'
import {
  orderFactory,
  orderItemFactory,
} from '@scayle/storefront-nuxt/test/factories'
import { useOrderEvents } from './useOrderEvents'
import type { Order } from '#shared/types/order'

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

vi.mock('@scayle/storefront-nuxt/composables', async (importActual) => {
  const actual =
    await importActual<typeof import('@scayle/storefront-nuxt/composables')>()
  return {
    ...actual,
    useLog: vi.fn(() => console),
  }
})

describe('useOrderEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('trackPurchase', () => {
    it('should track purchase event with complete order data', () => {
      const { trackPurchase } = useOrderEvents()

      const orderItem1 = orderItemFactory.build({
        product: { id: 1 },
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
          ],
        },
      })

      const orderItem2 = orderItemFactory.build({
        product: { id: 2 },
        price: {
          withTax: 4999,
          withoutTax: 4200,
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
      })

      const order = orderFactory.build({
        id: 12345,
        customer: { id: 67890 },
        currencyCode: 'EUR',
        cost: {
          withTax: 7998,
          withoutTax: 6700,
          tax: {
            vat: {
              amount: 1298 as CentAmount,
            },
          },
        },
        shipping: {
          deliveryCosts: 500 as CentAmount,
        },
        payment: [
          {
            key: 'credit_card',
          },
        ],
        items: [orderItem1, orderItem2],
      }) as unknown as Order

      trackPurchase(order)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'purchase',
        ecommerce: {
          transaction_id: '12345',
          customer_id: '67890',
          value: 79.98,
          sale_reduction_with_tax: 2.0,
          campaign_reduction_with_tax: 3.0,
          promotion_reduction_with_tax: 5.0,
          tax: 12.98,
          shipping: 5.0,
          currency: 'EUR',
          payment_type: 'credit_card',
          items: expect.any(Array),
          promotions: [],
        },
      })
    })

    it('should track purchase event with order without customer', () => {
      const { trackPurchase } = useOrderEvents()

      const orderItem = orderItemFactory.build({
        product: { id: 1 },
        price: {
          withTax: 2999,
          withoutTax: 2500,
          appliedReductions: [],
        },
      })

      const order = orderFactory.build({
        id: 12345,
        customer: undefined,
        currencyCode: 'USD',
        cost: {
          withTax: 2999,
          withoutTax: 2500,
          tax: {
            vat: {
              amount: 499 as CentAmount,
            },
          },
        },
        items: [orderItem],
      }) as unknown as Order

      trackPurchase(order)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'purchase',
        ecommerce: {
          transaction_id: '12345',
          customer_id: undefined,
          value: 29.99,
          sale_reduction_with_tax: undefined,
          campaign_reduction_with_tax: undefined,
          promotion_reduction_with_tax: undefined,
          tax: 4.99,
          shipping: undefined,
          currency: 'USD',
          payment_type: 'computop_creditcard',
          items: expect.any(Array),
          promotions: [],
        },
      })
    })

    it('should track purchase event with order without shipping', () => {
      const { trackPurchase } = useOrderEvents()

      const orderItem = orderItemFactory.build({
        product: { id: 1 },
        price: {
          withTax: 2999,
          withoutTax: 2500,
          appliedReductions: [],
        },
      })

      const order = orderFactory.build({
        id: 12345,
        currencyCode: 'EUR',
        cost: {
          withTax: 2999,
          withoutTax: 2500,
          tax: {
            vat: {
              amount: 499 as CentAmount,
            },
          },
        },
        shipping: undefined,
        items: [orderItem],
      }) as unknown as Order

      trackPurchase(order)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'purchase',
        ecommerce: {
          transaction_id: '12345',
          customer_id: '9876',
          value: 29.99,
          sale_reduction_with_tax: undefined,
          campaign_reduction_with_tax: undefined,
          promotion_reduction_with_tax: undefined,
          tax: 4.99,
          shipping: undefined,
          currency: 'EUR',
          payment_type: 'computop_creditcard',
          items: [
            {
              item_id: '1',
              quantity: 18,
              item_category: 'Frauen',
              item_category_id: '1',
              item_name: 'Test Attribute',
              item_brand: 'Test Attribute',
              item_size: 'Test Attribute',
              price_with_tax: 29.99,
              original_price_with_tax: 29.99,
              tax: 1.9,
              item_variant: '1',
              sold_out: false,
            },
          ],
          promotions: [],
        },
      })
    })

    it('should track purchase event with order without tax vat amount', () => {
      const { trackPurchase } = useOrderEvents()

      const orderItem = orderItemFactory.build({
        product: { id: 1 },
        price: {
          withTax: 2999,
          withoutTax: 2500,
          appliedReductions: [],
        },
      })

      const order = orderFactory.build({
        id: 12345,
        currencyCode: 'EUR',
        cost: {
          withTax: 2999,
          withoutTax: 2500,
          tax: {
            vat: undefined,
          },
        },
        items: [orderItem],
      }) as unknown as Order

      trackPurchase(order)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'purchase',
        ecommerce: {
          transaction_id: '12345',
          customer_id: '9876',
          value: 29.99,
          sale_reduction_with_tax: undefined,
          campaign_reduction_with_tax: undefined,
          promotion_reduction_with_tax: undefined,
          tax: undefined,
          shipping: undefined,
          currency: 'EUR',
          payment_type: 'computop_creditcard',
          items: expect.any(Array),
          promotions: [],
        },
      })
    })

    it('should track purchase event with order containing only sale reductions', () => {
      const { trackPurchase } = useOrderEvents()

      const orderItem1 = orderItemFactory.build({
        product: { id: 1 },
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
      })

      const orderItem2 = orderItemFactory.build({
        product: { id: 2 },
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
      })

      const order = orderFactory.build({
        id: 12345,
        currencyCode: 'EUR',
        cost: {
          withTax: 7998,
          withoutTax: 6700,
          tax: {
            vat: {
              amount: 1298 as CentAmount,
            },
          },
        },
        items: [orderItem1, orderItem2],
      }) as unknown as Order

      trackPurchase(order)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'purchase',
        ecommerce: {
          transaction_id: '12345',
          customer_id: '9876',
          value: 79.98,
          sale_reduction_with_tax: 9.5,
          tax: 12.98,
          currency: 'EUR',
          payment_type: 'computop_creditcard',
          items: expect.any(Array),
          promotions: [],
        },
      })
    })

    it('should track purchase event with order containing only campaign reductions', () => {
      const { trackPurchase } = useOrderEvents()

      const orderItem = orderItemFactory.build({
        product: { id: 1 },
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
      })

      const order = orderFactory.build({
        id: 12345,
        currencyCode: 'EUR',
        cost: {
          withTax: 2999,
          withoutTax: 2500,
          tax: {
            vat: {
              amount: 499 as CentAmount,
            },
          },
        },
        items: [orderItem],
      }) as unknown as Order

      trackPurchase(order)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'purchase',
        ecommerce: {
          transaction_id: '12345',
          customer_id: '9876',
          value: 29.99,
          campaign_reduction_with_tax: 3.0,
          tax: 4.99,
          currency: 'EUR',
          payment_type: 'computop_creditcard',
          items: expect.any(Array),
          promotions: [],
        },
      })
    })

    it('should track purchase event with order containing only promotion reductions', () => {
      const { trackPurchase } = useOrderEvents()

      const orderItem = orderItemFactory.build({
        product: { id: 1 },
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
      })

      const order = orderFactory.build({
        id: 12345,
        currencyCode: 'EUR',
        cost: {
          withTax: 2999,
          withoutTax: 2500,
          tax: {
            vat: {
              amount: 499 as CentAmount,
            },
          },
        },
        items: [orderItem],
      }) as unknown as Order

      trackPurchase(order)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'purchase',
        ecommerce: {
          transaction_id: '12345',
          customer_id: '9876',
          value: 29.99,
          promotion_reduction_with_tax: 5.0,
          tax: 4.99,
          currency: 'EUR',
          payment_type: 'computop_creditcard',
          items: expect.any(Array),
          promotions: [],
        },
      })
    })

    it('should track purchase event with order containing all reduction types', () => {
      const { trackPurchase } = useOrderEvents()

      const orderItem1 = orderItemFactory.build({
        product: { id: 1 },
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
          ],
        },
      })

      const orderItem2 = orderItemFactory.build({
        product: { id: 2 },
        price: {
          withTax: 4999,
          withoutTax: 4200,
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
              category: 'sale',
              type: 'relative',
              amount: {
                relative: 0.05,
                absoluteWithTax: 250 as CentAmount,
              },
            },
          ],
        },
      })

      const order = orderFactory.build({
        id: 12345,
        currencyCode: 'EUR',
        cost: {
          withTax: 7998,
          withoutTax: 6700,
          tax: {
            vat: {
              amount: 1298 as CentAmount,
            },
          },
        },
        items: [orderItem1, orderItem2],
      }) as unknown as Order

      trackPurchase(order)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'purchase',
        ecommerce: {
          transaction_id: '12345',
          customer_id: '9876',
          value: 79.98,
          sale_reduction_with_tax: 4.5,
          campaign_reduction_with_tax: 3.0,
          promotion_reduction_with_tax: 5.0,
          tax: 12.98,
          currency: 'EUR',
          payment_type: 'computop_creditcard',
          items: expect.any(Array),
          promotions: [],
        },
      })
    })

    it('should track purchase event with empty items array', () => {
      const { trackPurchase } = useOrderEvents()

      const order = orderFactory.build({
        id: 12345,
        currencyCode: 'EUR',
        cost: {
          withTax: 0,
          withoutTax: 0,
          tax: {
            vat: {
              amount: 0 as CentAmount,
            },
          },
        },
        items: [],
      }) as unknown as Order

      trackPurchase(order)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'purchase',
        ecommerce: {
          transaction_id: '12345',
          customer_id: '9876',
          currency: 'EUR',
          payment_type: 'computop_creditcard',
          items: [],
          promotions: [],
        },
      })
    })

    it('should track purchase event with multiple items and calculate correct totals', () => {
      const { trackPurchase } = useOrderEvents()

      const orderItem1 = orderItemFactory.build({
        product: { id: 1 },
        price: {
          withTax: 10000,
          withoutTax: 8400,
          appliedReductions: [
            {
              category: 'sale',
              type: 'relative',
              amount: {
                relative: 0.1,
                absoluteWithTax: 1000 as CentAmount,
              },
            },
          ],
        },
      })

      const orderItem2 = orderItemFactory.build({
        product: { id: 2 },
        price: {
          withTax: 5000,
          withoutTax: 4200,
          appliedReductions: [
            {
              category: 'campaign',
              type: 'relative',
              amount: {
                relative: 0.1,
                absoluteWithTax: 500 as CentAmount,
              },
            },
          ],
        },
      })

      const orderItem3 = orderItemFactory.build({
        product: { id: 3 },
        price: {
          withTax: 3000,
          withoutTax: 2520,
          appliedReductions: [
            {
              category: 'promotion',
              type: 'relative',
              amount: {
                relative: 0.1,
                absoluteWithTax: 300 as CentAmount,
              },
            },
          ],
        },
      })

      const order = orderFactory.build({
        id: 12345,
        currencyCode: 'EUR',
        cost: {
          withTax: 18000,
          withoutTax: 15120,
          tax: {
            vat: {
              amount: 2880 as CentAmount,
            },
          },
        },
        items: [orderItem1, orderItem2, orderItem3],
      }) as unknown as Order

      trackPurchase(order)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'purchase',
        ecommerce: {
          transaction_id: '12345',
          customer_id: '9876',
          value: 180.0,
          sale_reduction_with_tax: 10.0,
          campaign_reduction_with_tax: 5.0,
          promotion_reduction_with_tax: 3.0,
          tax: 28.8,
          currency: 'EUR',
          payment_type: 'computop_creditcard',
          items: expect.any(Array),
          promotions: [],
        },
      })
      expect(mocks.push).toHaveBeenCalledTimes(1)
    })

    it('should track purchase event with payment array containing multiple payments', () => {
      const { trackPurchase } = useOrderEvents()

      const orderItem = orderItemFactory.build({
        product: { id: 1 },
        price: {
          withTax: 2999,
          withoutTax: 2500,
          appliedReductions: [],
        },
      })

      const order = orderFactory.build({
        id: 12345,
        currencyCode: 'EUR',
        cost: {
          withTax: 2999,
          withoutTax: 2500,
          tax: {
            vat: {
              amount: 499 as CentAmount,
            },
          },
        },
        payment: [
          {
            key: 'paypal',
          },
          {
            key: 'credit_card',
          },
        ],
        items: [orderItem],
      }) as unknown as Order

      trackPurchase(order)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'purchase',
        ecommerce: {
          transaction_id: '12345',
          customer_id: '9876',
          value: 29.99,
          tax: 4.99,
          currency: 'EUR',
          payment_type: 'paypal',
          items: expect.any(Array),
          promotions: [],
        },
      })
    })
  })
})

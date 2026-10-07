import { describe, it, expect, vi, beforeEach } from 'vitest'
import type {
  BasketTotalPrice,
  AppliedReduction,
  BasketItem,
} from '@scayle/storefront-nuxt'
import { basketItemFactory } from '@scayle/storefront-nuxt/test/factories'
import type { PaymentOptionKey } from '@scayle/checkout-types'
import { useCheckoutEvents } from './useCheckoutEvents'

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

describe('useCheckoutEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('trackBeginCheckout', () => {
    it('should track begin checkout event with all cost reductions and regular type', () => {
      const { trackBeginCheckout } = useCheckoutEvents()

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

      trackBeginCheckout(cost, 'regular')

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'begin_checkout',
        value: 100.0,
        sale_reduction_with_tax: 5.0,
        promotion_reduction_with_tax: 15.0,
        campaign_reduction_with_tax: 10.0,
        tax: 16.0,
        checkout_type: 'regular',
      })
    })

    it('should track begin checkout event with express type', () => {
      const { trackBeginCheckout } = useCheckoutEvents()

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

      trackBeginCheckout(cost, 'express')

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'begin_checkout',
        value: 50.0,
        sale_reduction_with_tax: undefined,
        promotion_reduction_with_tax: undefined,
        campaign_reduction_with_tax: undefined,
        tax: 8.0,
        checkout_type: 'express',
      })
    })

    it('should track begin checkout event without cost', () => {
      const { trackBeginCheckout } = useCheckoutEvents()

      trackBeginCheckout(undefined, 'regular')

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'begin_checkout',
        value: undefined,
        sale_reduction_with_tax: undefined,
        promotion_reduction_with_tax: undefined,
        campaign_reduction_with_tax: undefined,
        tax: undefined,
        checkout_type: 'regular',
      })
    })

    it('should track begin checkout event without type', () => {
      const { trackBeginCheckout } = useCheckoutEvents()

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

      trackBeginCheckout(cost, undefined)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'begin_checkout',
        value: 50.0,
        sale_reduction_with_tax: undefined,
        promotion_reduction_with_tax: undefined,
        campaign_reduction_with_tax: undefined,
        tax: 8.0,
        checkout_type: undefined,
      })
    })

    it('should track begin checkout event with only campaign reduction', () => {
      const { trackBeginCheckout } = useCheckoutEvents()

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

      trackBeginCheckout(cost, 'regular')

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'begin_checkout',
        value: 100.0,
        sale_reduction_with_tax: undefined,
        promotion_reduction_with_tax: undefined,
        campaign_reduction_with_tax: 10.0,
        tax: 16.0,
        checkout_type: 'regular',
      })
    })
  })

  describe('trackAddShippingInfo', () => {
    it('should track add shipping info event with basket items', () => {
      const { trackAddShippingInfo } = useCheckoutEvents()

      const basketItems: BasketItem[] = [
        basketItemFactory.build({
          product: { id: 1 },
          quantity: 2,
        }),
        basketItemFactory.build({
          product: { id: 2 },
          quantity: 1,
        }),
      ]

      trackAddShippingInfo('standard', 'DHL', 'EUR', 5.99, basketItems)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'add_shipping_info',
        shipping_type: 'standard',
        shipping_method: 'DHL',
        currency: 'EUR',
        value: 5.99,
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: basketItems[0]!.product.id.toString(),
              index: 0,
            }),
            expect.objectContaining({
              item_id: basketItems[1]!.product.id.toString(),
              index: 1,
            }),
          ]),
        },
      })
    })

    it('should track add shipping info event without basket items', () => {
      const { trackAddShippingInfo } = useCheckoutEvents()

      trackAddShippingInfo('express', 'UPS', 'USD', 10.5, undefined)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'add_shipping_info',
        shipping_type: 'express',
        shipping_method: 'UPS',
        currency: 'USD',
        value: 10.5,
        ecommerce: { items: undefined },
      })
    })

    it('should track add shipping info event with empty basket items array', () => {
      const { trackAddShippingInfo } = useCheckoutEvents()

      trackAddShippingInfo('overnight', 'FedEx', 'EUR', 25.0, [])

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'add_shipping_info',
        shipping_type: 'overnight',
        shipping_method: 'FedEx',
        currency: 'EUR',
        value: 25.0,
        ecommerce: { items: [] },
      })
    })

    it('should track add shipping info event with single basket item', () => {
      const { trackAddShippingInfo } = useCheckoutEvents()

      const basketItems: BasketItem[] = [
        basketItemFactory.build({
          product: { id: 5 },
          quantity: 3,
        }),
      ]

      trackAddShippingInfo('standard', 'DHL', 'EUR', 3.5, basketItems)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'add_shipping_info',
        shipping_type: 'standard',
        shipping_method: 'DHL',
        currency: 'EUR',
        value: 3.5,
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: basketItems[0]!.product.id.toString(),
              index: 0,
            }),
          ]),
        },
      })
    })

    it('should track add shipping info event with different shipping types', () => {
      const { trackAddShippingInfo } = useCheckoutEvents()

      const shippingTypes = ['standard', 'express', 'overnight']
      const basketItems: BasketItem[] = [
        basketItemFactory.build({
          product: { id: 1 },
        }),
      ]

      for (const shippingType of shippingTypes) {
        vi.clearAllMocks()
        trackAddShippingInfo(shippingType, 'DHL', 'EUR', 5.0, basketItems)

        expect(mocks.push).toHaveBeenCalledWith({
          event: 'add_shipping_info',
          shipping_type: shippingType,
          shipping_method: 'DHL',
          currency: 'EUR',
          value: 5.0,
          ecommerce: {
            items: expect.arrayContaining([
              expect.objectContaining({
                item_id: basketItems[0]!.product.id.toString(),
                index: 0,
              }),
            ]),
          },
        })
      }
    })
  })

  describe('trackAddPaymentInfo', () => {
    it('should track add payment info event with basket items', () => {
      const { trackAddPaymentInfo } = useCheckoutEvents()

      const basketItems: BasketItem[] = [
        basketItemFactory.build({
          product: { id: 1 },
          quantity: 2,
        }),
        basketItemFactory.build({
          product: { id: 2 },
          quantity: 1,
        }),
      ]

      trackAddPaymentInfo('standard_creditcard', basketItems)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'add_payment_info',
        payment_type: 'standard_creditcard',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: basketItems[0]!.product.id.toString(),
              index: 0,
            }),
            expect.objectContaining({
              item_id: basketItems[1]!.product.id.toString(),
              index: 1,
            }),
          ]),
        },
      })
    })

    it('should track add payment info event without basket items', () => {
      const { trackAddPaymentInfo } = useCheckoutEvents()

      trackAddPaymentInfo('paypal', undefined)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'add_payment_info',
        payment_type: 'paypal',
        ecommerce: { items: undefined },
      })
    })

    it('should track add payment info event with empty basket items array', () => {
      const { trackAddPaymentInfo } = useCheckoutEvents()

      trackAddPaymentInfo('standard_cod', [])

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'add_payment_info',
        payment_type: 'standard_cod',
        ecommerce: { items: [] },
      })
    })

    it('should track add payment info event with single basket item', () => {
      const { trackAddPaymentInfo } = useCheckoutEvents()

      const basketItems: BasketItem[] = [
        basketItemFactory.build({
          product: { id: 5 },
          quantity: 3,
        }),
      ]

      trackAddPaymentInfo('standard_creditcard', basketItems)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'add_payment_info',
        payment_type: 'standard_creditcard',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: basketItems[0]!.product.id.toString(),
              index: 0,
            }),
          ]),
        },
      })
    })

    it('should track add payment info event with different payment types', () => {
      const { trackAddPaymentInfo } = useCheckoutEvents()

      const paymentTypes = [
        'standard_creditcard',
        'paypal',
        'standard_cod',
        'standard_cheque',
      ]
      const basketItems: BasketItem[] = [
        basketItemFactory.build({
          product: { id: 1 },
        }),
      ]

      for (const paymentType of paymentTypes) {
        vi.clearAllMocks()
        trackAddPaymentInfo(paymentType as PaymentOptionKey, basketItems)

        expect(mocks.push).toHaveBeenCalledWith({
          event: 'add_payment_info',
          payment_type: paymentType,
          ecommerce: {
            items: expect.arrayContaining([
              expect.objectContaining({
                item_id: basketItems[0]!.product.id.toString(),
                index: 0,
              }),
            ]),
          },
        })
      }
    })
  })

  describe('trackCompleteCheckout', () => {
    it('should track successful checkout completion', () => {
      const { trackCompleteCheckout } = useCheckoutEvents()

      const basketItems: BasketItem[] = [
        basketItemFactory.build({
          product: { id: 1 },
          quantity: 2,
        }),
        basketItemFactory.build({
          product: { id: 2 },
          quantity: 1,
        }),
      ]

      trackCompleteCheckout(basketItems)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'complete_checkout',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: basketItems[0]!.product.id.toString(),
              index: 0,
            }),
            expect.objectContaining({
              item_id: basketItems[1]!.product.id.toString(),
              index: 1,
            }),
          ]),
        },
      })
    })

    it('should track checkout completion with single basket item', () => {
      const { trackCompleteCheckout } = useCheckoutEvents()

      const basketItems: BasketItem[] = [
        basketItemFactory.build({
          product: { id: 5 },
          quantity: 3,
        }),
      ]

      trackCompleteCheckout(basketItems)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'complete_checkout',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: basketItems[0]!.product.id.toString(),
              index: 0,
            }),
          ]),
        },
      })
    })

    it('should track checkout completion with multiple basket items', () => {
      const { trackCompleteCheckout } = useCheckoutEvents()

      const basketItems: BasketItem[] = [
        basketItemFactory.build({
          product: { id: 10 },
          quantity: 2,
        }),
        basketItemFactory.build({
          product: { id: 20 },
          quantity: 1,
        }),
        basketItemFactory.build({
          product: { id: 30 },
          quantity: 3,
        }),
      ]

      trackCompleteCheckout(basketItems)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'complete_checkout',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: basketItems[0]!.product.id.toString(),
              index: 0,
            }),
            expect.objectContaining({
              item_id: basketItems[1]!.product.id.toString(),
              index: 1,
            }),
            expect.objectContaining({
              item_id: basketItems[2]!.product.id.toString(),
              index: 2,
            }),
          ]),
        },
      })
    })
  })
})

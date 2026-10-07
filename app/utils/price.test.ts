import { describe, it, expect } from 'vitest'
import type { CentAmount } from '@scayle/storefront-nuxt'
import { getShippingCost, type AppliedFees } from './price'

describe('getShippingCost', () => {
  it('handles various fee scenarios and edge cases', () => {
    const appliedFees: AppliedFees = [
      {
        amount: {
          withoutTax: 500 as CentAmount,
          withTax: 700 as CentAmount,
        },
        category: 'delivery',
        key: 'test-key-1',
        option: 'test-option-1',
        tax: {
          vat: {
            amount: 200,
            rate: 0.4,
          },
        },
      },
      {
        amount: {
          withoutTax: 300 as CentAmount,
          withTax: 400 as CentAmount,
        },
        category: 'delivery',
        key: 'test-key-2',
        option: 'test-option-2',
        tax: {
          vat: {
            amount: 100,
            rate: 0.33,
          },
        },
      },
      {
        amount: {
          withoutTax: 200 as CentAmount,
          withTax: 250 as CentAmount,
        },
        category: 'payment',
        key: 'test-key-3',
        option: 'test-option-3',
        tax: {
          vat: {
            amount: 50,
            rate: 0.25,
          },
        },
      },
    ]

    // Test without tax (default behavior)
    expect(getShippingCost(appliedFees)).toEqual(800) // 500 + 300 (only delivery fees)

    // Test with tax included
    expect(getShippingCost(appliedFees, { includeTax: true })).toEqual(1100) // 700 + 400

    // Test with empty fees
    expect(getShippingCost([])).toEqual(0)
    expect(getShippingCost(undefined)).toEqual(0)

    // Test with only non-delivery fees
    const nonDeliveryFees: AppliedFees = [
      {
        amount: {
          withoutTax: 100 as CentAmount,
          withTax: 120 as CentAmount,
        },
        category: 'payment',
        key: 'test-key',
        option: 'test-option',
        tax: {
          vat: {
            amount: 20,
            rate: 0.2,
          },
        },
      },
    ]
    expect(getShippingCost(nonDeliveryFees)).toEqual(0)
    expect(getShippingCost(nonDeliveryFees, { includeTax: true })).toEqual(0)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { BasketItemPromotion } from '@scayle/storefront-nuxt'
import {
  automaticDiscountPromotionFactory,
  basketItemFactory,
  productFactory,
  variantFactory,
} from '@scayle/storefront-nuxt/test/factories'
import { mapBasketItemToTracking } from './basket'
import {
  ATTRIBUTE_KEY_BRAND,
  ATTRIBUTE_KEY_NAME,
  ATTRIBUTE_KEY_SIZE,
} from '#shared/constants/attributeKeys'

describe('mapBasketItemToTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should map basket item to ecommerce item', () => {
    const promo1 = automaticDiscountPromotionFactory.build({
      id: 'p1',
      isValid: true,
    }) as BasketItemPromotion
    const promo2 = automaticDiscountPromotionFactory.build({
      id: 'p2',
    }) as BasketItemPromotion
    const basketItem = basketItemFactory.build({
      product: productFactory.build({
        id: 123,
        categories: [
          [
            {
              categoryId: 1,
              categoryName: 'Shoes',
              categoryUrl: '/shoes',
              categorySlug: 'shoes',
              categoryHidden: false,
            },
            {
              categoryId: 2,
              categoryName: 'Running',
              categoryUrl: '/running',
              categorySlug: 'running',
              categoryHidden: false,
            },
            {
              categoryId: 3,
              categoryName: 'Sports',
              categoryUrl: '/sports',
              categorySlug: 'sports',
              categoryHidden: false,
            },
          ],
        ],
        attributes: {
          [ATTRIBUTE_KEY_NAME]: {
            label: 'Product Name',
            values: {
              id: 1,
              label: 'Test Product',
              value: 'test-product',
            },
          },
          [ATTRIBUTE_KEY_BRAND]: {
            label: 'Brand Name',
            values: {
              id: 1,
              label: 'Brand Name',
              value: 'brand-name',
            },
          },
        },
      }),
      variant: variantFactory.build({
        attributes: {
          [ATTRIBUTE_KEY_SIZE]: {
            label: 'Test Size',
            values: {
              id: 1,
              label: 'Test Size',
              value: 'test-size',
            },
          },
        },
      }),
      price: {
        total: {
          withTax: 2999,
          withoutTax: 2500,
          currencyCode: 'EUR',
        },
        unit: {
          withTax: 2999,
          withoutTax: 2500,
          currencyCode: 'EUR',
        },
      },
      quantity: 2,
      promotions: [promo1, promo2],
    })

    const result = mapBasketItemToTracking(basketItem)

    expect(result).toEqual({
      item_id: '123',
      item_name: 'Test Product',
      price_with_tax: 29.99,
      original_price_with_tax: 29.99,
      quantity: 2,
      currency: 'EUR',
      item_brand: 'Brand Name',
      item_brand_id: '1',
      item_size: 'Test Size',
      sold_out: false,
      item_category: 'Shoes',
      item_category_id: '1',
      item_category2: 'Running',
      item_category2_id: '2',
      item_category3: 'Sports',
      item_category3_id: '3',
      promotions: ['p1'],
      item_variant: '1',
    })
  })

  it('should handle different quantities', () => {
    const basketItem = basketItemFactory.build({
      product: productFactory.build({
        id: 789,
        attributes: {
          [ATTRIBUTE_KEY_NAME]: {
            label: 'Product Name',
            values: {
              id: 1,
              label: 'Test Product',
              value: 'test-product',
            },
          },
          [ATTRIBUTE_KEY_BRAND]: {
            label: 'Brand Name',
            values: {
              id: 1,
              label: 'Brand Name',
              value: 'brand-name',
            },
          },
        },
      }),
      variant: variantFactory.build(),
      price: {
        total: {
          withTax: 4999,
          withoutTax: 4200,
          currencyCode: 'EUR',
        },
        unit: {
          withTax: 4999,
          withoutTax: 4200,
          currencyCode: 'EUR',
        },
      },
      quantity: 5,
    })

    const result = mapBasketItemToTracking(basketItem)

    expect(result).toEqual({
      item_id: '789',
      item_name: 'Test Product',
      price_with_tax: 49.99,
      original_price_with_tax: 49.99,
      item_brand: 'Brand Name',
      item_brand_id: '1',
      quantity: 5,
      currency: 'EUR',
      sold_out: false,
      item_variant: '1',
    })
  })

  it('should map categories from the last array to item_category, item_category2, and item_category3', () => {
    const basketItem = basketItemFactory.build({
      product: productFactory.build({
        id: 123,
        categories: [
          [
            {
              categoryId: 1,
              categoryName: 'Shoes',
              categoryUrl: '/shoes',
              categorySlug: 'shoes',
              categoryHidden: false,
            },
            {
              categoryId: 2,
              categoryName: 'Running',
              categoryUrl: '/running',
              categorySlug: 'running',
              categoryHidden: false,
            },
          ],
          [
            {
              categoryId: 3,
              categoryName: 'Sports',
              categoryUrl: '/sports',
              categorySlug: 'sports',
              categoryHidden: false,
            },
            {
              categoryId: 4,
              categoryName: 'Outdoor',
              categoryUrl: '/outdoor',
              categorySlug: 'outdoor',
              categoryHidden: false,
            },
            {
              categoryId: 5,
              categoryName: 'Fitness',
              categoryUrl: '/fitness',
              categorySlug: 'fitness',
              categoryHidden: false,
            },
          ],
        ],
      }),
      price: {
        total: {
          withTax: 2999,
          withoutTax: 2500,
          currencyCode: 'EUR',
        },
        unit: {
          withTax: 2999,
          withoutTax: 2500,
          currencyCode: 'EUR',
        },
      },
      quantity: 1,
    })

    const result = mapBasketItemToTracking(basketItem)

    expect(result).toMatchObject({
      item_id: '123',
      price_with_tax: 29.99,
      original_price_with_tax: 29.99,
      item_category: 'Sports',
      item_category_id: '3',
      item_category2: 'Outdoor',
      item_category2_id: '4',
      item_category3: 'Fitness',
      item_category3_id: '5',
      item_variant: '1',
    })
  })

  it('should handle products with fewer than 3 categories in the last array', () => {
    const basketItem = basketItemFactory.build({
      product: productFactory.build({
        id: 123,
        categories: [
          [
            {
              categoryId: 1,
              categoryName: 'Shoes',
              categoryUrl: '/shoes',
              categorySlug: 'shoes',
              categoryHidden: false,
            },
          ],
          [
            {
              categoryId: 2,
              categoryName: 'Running',
              categoryUrl: '/running',
              categorySlug: 'running',
              categoryHidden: false,
            },
          ],
        ],
      }),
      price: {
        total: {
          withTax: 2999,
          withoutTax: 2500,
          currencyCode: 'EUR',
        },
        unit: {
          withTax: 2999,
          withoutTax: 2500,
          currencyCode: 'EUR',
        },
      },
      quantity: 1,
    })

    const result = mapBasketItemToTracking(basketItem)

    expect(result).toMatchObject({
      item_id: '123',
      item_category: 'Running',
      item_category_id: '2',
      item_category2: undefined,
      item_category2_id: undefined,
      item_category3: undefined,
      item_category3_id: undefined,
      original_price_with_tax: 29.99,
    })
  })

  it('should handle products with no categories', () => {
    const basketItem = basketItemFactory.build({
      product: productFactory.build({
        id: 123,
        categories: undefined,
      }),
      price: {
        total: {
          withTax: 2999,
          withoutTax: 2500,
          currencyCode: 'EUR',
        },
        unit: {
          withTax: 2999,
          withoutTax: 2500,
          currencyCode: 'EUR',
        },
      },
      quantity: 1,
    })

    const result = mapBasketItemToTracking(basketItem)

    expect(result).toMatchObject({
      item_id: '123',
      item_category: undefined,
      item_category_id: undefined,
      item_category2: undefined,
      item_category2_id: undefined,
      item_category3: undefined,
      item_category3_id: undefined,
      original_price_with_tax: 29.99,
    })
  })
})

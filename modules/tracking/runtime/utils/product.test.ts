import { describe, it, expect } from 'vitest'
import type { ProductCategory } from '@scayle/storefront-nuxt'
import {
  productFactory,
  variantFactory,
  priceFactory,
} from '@scayle/storefront-nuxt/test/factories'
import { mapProductToTracking, mapVariantToTracking } from './product'
import {
  ATTRIBUTE_KEY_NAME,
  ATTRIBUTE_KEY_BRAND,
  ATTRIBUTE_KEY_SIZE,
} from '#shared/constants/attributeKeys'

describe('mapProductToTracking', () => {
  it('should map product to ecommerce item with all fields', () => {
    const categories: ProductCategory[][] = [
      [
        {
          categoryId: 1,
          categoryName: 'Category 1',
          categoryUrl: '/cat1',
          categorySlug: 'cat1',
          categoryHidden: false,
        },
        {
          categoryId: 2,
          categoryName: 'Category 2',
          categoryUrl: '/cat2',
          categorySlug: 'cat2',
          categoryHidden: false,
        },
        {
          categoryId: 3,
          categoryName: 'Category 3',
          categoryUrl: '/cat3',
          categorySlug: 'cat3',
          categoryHidden: false,
        },
      ],
    ]

    const product = productFactory.build({
      id: 123,
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
            id: 101,
            label: 'Test Brand',
            value: 'test-brand',
          },
        },
      },
      categories,
      isSoldOut: false,
      priceRange: {
        min: priceFactory.build({
          withTax: 2999,
          currencyCode: 'EUR',
        }),
        max: priceFactory.build({
          withTax: 3999,
          currencyCode: 'EUR',
        }),
      },
    })

    const result = mapProductToTracking(product)

    expect(result).toEqual({
      item_id: '123',
      item_name: 'Test Product',
      price_with_tax: 29.99,
      original_price_with_tax: 29.99,
      sale_discount_with_tax: undefined,
      campaign_discount_with_tax: undefined,
      promotion_discount_with_tax: undefined,
      tax: 0.01,
      quantity: 1,
      currency: 'EUR',
      item_brand: 'Test Brand',
      item_brand_id: '101',
      sold_out: false,
      item_category: 'Category 1',
      item_category_id: '1',
      item_category2: 'Category 2',
      item_category2_id: '2',
      item_category3: 'Category 3',
      item_category3_id: '3',
    })
  })

  it('should map product to ecommerce item with missing optional fields', () => {
    const product = productFactory.build({
      id: 456,
      attributes: {},
      categories: undefined,
      isSoldOut: true,
      priceRange: {
        min: priceFactory.build({
          withTax: 2999,
          currencyCode: 'EUR',
          appliedReductions: [],
        }),
      },
    })

    const result = mapProductToTracking(product)

    expect(result).toEqual({
      item_id: '456',
      item_name: undefined,
      price_with_tax: 29.99,
      original_price_with_tax: 29.99,
      sale_discount_with_tax: undefined,
      campaign_discount_with_tax: undefined,
      promotion_discount_with_tax: undefined,
      tax: 0.01,
      quantity: 1,
      currency: 'EUR',
      item_brand: undefined,
      item_brand_id: undefined,
      item_size: undefined,
      sold_out: true,
      item_category: undefined,
      item_category_id: undefined,
      item_category2: undefined,
      item_category2_id: undefined,
      item_category3: undefined,
      item_category3_id: undefined,
    })
  })

  it('should map product to ecommerce item with partial categories', () => {
    const categories: ProductCategory[][] = [
      [
        {
          categoryId: 10,
          categoryName: 'Single Category',
          categoryUrl: '/single',
          categorySlug: 'single',
          categoryHidden: false,
        },
      ],
    ]

    const product = productFactory.build({
      id: 789,
      categories,
    })

    const result = mapProductToTracking(product)

    expect(result.item_category).toBe('Single Category')
    expect(result.item_category_id).toBe('10')
    expect(result.item_category2).toBeUndefined()
    expect(result.item_category2_id).toBeUndefined()
    expect(result.item_category3).toBeUndefined()
    expect(result.item_category3_id).toBeUndefined()
  })

  it('should map product to ecommerce item with categories from last array', () => {
    const categories: ProductCategory[][] = [
      [
        {
          categoryId: 1,
          categoryName: 'First Array Category',
          categoryUrl: '/first',
          categorySlug: 'first',
          categoryHidden: false,
        },
      ],
      [
        {
          categoryId: 2,
          categoryName: 'Last Array Category',
          categoryUrl: '/last',
          categorySlug: 'last',
          categoryHidden: false,
        },
      ],
    ]

    const product = productFactory.build({
      id: 999,
      categories,
    })

    const result = mapProductToTracking(product)

    expect(result.item_category).toBe('Last Array Category')
    expect(result.item_category_id).toBe('2')
  })

  it('should map product to ecommerce item with empty categories', () => {
    const product = productFactory.build({
      id: 111,
      categories: [],
    })

    const result = mapProductToTracking(product)

    expect(result.item_category).toBeUndefined()
    expect(result.item_category_id).toBeUndefined()
    expect(result.item_category2).toBeUndefined()
    expect(result.item_category2_id).toBeUndefined()
    expect(result.item_category3).toBeUndefined()
    expect(result.item_category3_id).toBeUndefined()
  })
})

describe('mapVariantToTracking', () => {
  it('should map variant to ecommerce item with all fields and custom quantity', () => {
    const variant = variantFactory.build({
      id: 123,
      attributes: {
        [ATTRIBUTE_KEY_SIZE]: {
          label: 'Size',
          values: {
            id: 5,
            label: 'L',
            value: 'l',
          },
        },
      },
      price: priceFactory.build({
        withTax: 4999,
        currencyCode: 'USD',
      }),
      stock: {
        warehouseId: 1,
        quantity: 10,
      },
    })

    const result = mapVariantToTracking(variant)

    expect(result).toEqual({
      price_with_tax: 49.99,
      original_price_with_tax: 49.99,
      sale_discount_with_tax: undefined,
      campaign_discount_with_tax: undefined,
      promotion_discount_with_tax: undefined,
      tax: 0.01,
      currency: 'USD',
      item_size: 'L',
      sold_out: false,
      quantity: 10,
      item_variant: '123',
    })
  })

  it('should map variant to ecommerce item with sold out status', () => {
    const variant = variantFactory.build({
      id: 111,
      stock: {
        warehouseId: 1,
        quantity: 0,
      },
    })

    const result = mapVariantToTracking(variant)

    expect(result.sold_out).toBe(true)
  })

  it('should map variant to ecommerce item with missing optional fields', () => {
    const variant = variantFactory.build({
      id: 333,
      attributes: {},
      stock: {
        warehouseId: 1,
        quantity: 1,
      },
    })

    const result = mapVariantToTracking(variant)

    expect(result).toEqual({
      price_with_tax: 1,
      original_price_with_tax: 1,
      sale_discount_with_tax: undefined,
      campaign_discount_with_tax: undefined,
      promotion_discount_with_tax: undefined,
      tax: 0.01,
      quantity: 1,
      currency: 'USD',
      item_size: undefined,
      sold_out: false,
      item_category: undefined,
      item_category_id: undefined,
      item_category2: undefined,
      item_category2_id: undefined,
      item_category3: undefined,
      item_category3_id: undefined,
      item_variant: '333',
    })
  })
})

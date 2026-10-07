import type { ProductCategory } from '@scayle/storefront-nuxt'
import { describe, it, expect } from 'vitest'
import { getEcommerceCategories } from './category'

describe('extractCategories', () => {
  it('should extract up to 3 categories from the last array', () => {
    const categories: ProductCategory[][] = [
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
      ],
    ]

    const result = getEcommerceCategories(categories)

    expect(result).toEqual({
      item_category: 'Sports',
      item_category_id: '3',
      item_category2: 'Outdoor',
      item_category2_id: '4',
    })
  })

  it('should only use categories from the last array, not earlier arrays', () => {
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
          categoryName: 'Second Array Category',
          categoryUrl: '/second',
          categorySlug: 'second',
          categoryHidden: false,
        },
      ],
      [
        {
          categoryId: 3,
          categoryName: 'Last Array Category',
          categoryUrl: '/last',
          categorySlug: 'last',
          categoryHidden: false,
        },
      ],
    ]

    const result = getEcommerceCategories(categories)

    expect(result).toEqual({
      item_category: 'Last Array Category',
      item_category_id: '3',
    })
  })

  it('should limit to 5 categories even if the last array has more', () => {
    const categories: ProductCategory[][] = [
      [
        {
          categoryId: 1,
          categoryName: 'Category 1',
          categoryUrl: '/cat1',
          categorySlug: 'cat1',
          categoryHidden: false,
        },
      ],
      [
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
        {
          categoryId: 4,
          categoryName: 'Category 4',
          categoryUrl: '/cat4',
          categorySlug: 'cat4',
          categoryHidden: false,
        },
        {
          categoryId: 5,
          categoryName: 'Category 5',
          categoryUrl: '/cat5',
          categorySlug: 'cat5',
          categoryHidden: false,
        },
        {
          categoryId: 6,
          categoryName: 'Category 6',
          categoryUrl: '/cat6',
          categorySlug: 'cat6',
          categoryHidden: false,
        },
        {
          categoryId: 7,
          categoryName: 'Category 7',
          categoryUrl: '/cat7',
          categorySlug: 'cat7',
          categoryHidden: false,
        },
      ],
    ]

    const result = getEcommerceCategories(categories)

    expect(result).toEqual({
      item_category: 'Category 2',
      item_category_id: '2',
      item_category2: 'Category 3',
      item_category2_id: '3',
      item_category3: 'Category 4',
      item_category3_id: '4',
      item_category4: 'Category 5',
      item_category4_id: '5',
      item_category5: 'Category 6',
      item_category5_id: '6',
      item_category6: undefined,
      item_category6_id: undefined,
      item_category7: undefined,
      item_category7_id: undefined,
    })
  })

  it('should return empty array when categories is undefined', () => {
    const result = getEcommerceCategories(undefined)

    expect(result).toEqual({
      item_category: undefined,
      item_category_id: undefined,
      item_category2: undefined,
      item_category2_id: undefined,
      item_category3: undefined,
      item_category3_id: undefined,
    })
  })

  it('should return empty array when categories is empty', () => {
    const result = getEcommerceCategories([])

    expect(result).toEqual({
      item_category: undefined,
      item_category_id: undefined,
      item_category2: undefined,
      item_category2_id: undefined,
      item_category3: undefined,
      item_category3_id: undefined,
    })
  })

  it('should return empty array when the last array is empty', () => {
    const categories: ProductCategory[][] = [
      [
        {
          categoryId: 1,
          categoryName: 'Category 1',
          categoryUrl: '/cat1',
          categorySlug: 'cat1',
          categoryHidden: false,
        },
      ],
      [],
    ]

    const result = getEcommerceCategories(categories)

    expect(result).toEqual({
      item_category: undefined,
      item_category_id: undefined,
      item_category2: undefined,
      item_category2_id: undefined,
      item_category3: undefined,
      item_category3_id: undefined,
    })
  })
})

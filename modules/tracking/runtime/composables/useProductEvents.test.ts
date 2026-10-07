import { describe, it, expect, vi, beforeEach } from 'vitest'
import { productFactory } from '@scayle/storefront-nuxt/test/factories'
import { useProductEvents } from './useProductEvents'

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

vi.mock('@scayle/storefront-nuxt/composables', () => ({
  useLog: vi.fn(() => console),
}))

describe('useProductEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('trackViewItem', () => {
    it('should track view item event with product', () => {
      const { trackViewItem } = useProductEvents()

      const product = productFactory.build({ id: 1 })

      trackViewItem(product)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'view_item',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: product.id.toString(),
            }),
          ]),
        },
      })
    })

    it('should not track view item event with null product', () => {
      const { trackViewItem } = useProductEvents()

      trackViewItem(null)

      expect(mocks.push).not.toHaveBeenCalled()
    })

    it('should not track view item event with undefined product', () => {
      const { trackViewItem } = useProductEvents()

      trackViewItem(undefined)

      expect(mocks.push).not.toHaveBeenCalled()
    })
  })

  describe('trackSelectItem', () => {
    it('should track select item event with product', () => {
      const { trackSelectItem } = useProductEvents()

      const product = productFactory.build({ id: 1 })

      trackSelectItem(product, 'recommendation_slider')

      expect(mocks.push).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'select_item',
          item_list_name: 'recommendation_slider',
          ecommerce: expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                item_id: product.id.toString(),
                item_list_name: 'recommendation_slider',
              }),
            ]),
          }),
        }),
      )
    })
  })

  describe('trackViewItemList', () => {
    it('should track view item list event with products and itemList', () => {
      const { trackViewItemList } = useProductEvents()

      const products = [
        productFactory.build({ id: 5 }),
        productFactory.build({ id: 6 }),
        productFactory.build({ id: 7 }),
      ]

      trackViewItemList(products, 'recommendation_slider')

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'view_item_list',
        item_list_name: 'recommendation_slider',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: products[0]!.id.toString(),
            }),
            expect.objectContaining({
              item_id: products[1]!.id.toString(),
            }),
            expect.objectContaining({
              item_id: products[2]!.id.toString(),
            }),
            expect.objectContaining({
              item_list_name: 'recommendation_slider',
            }),
          ]),
        },
      })
    })

    it('should track view item list event with products without itemList', () => {
      const { trackViewItemList } = useProductEvents()

      const products = [
        productFactory.build({ id: 8 }),
        productFactory.build({ id: 9 }),
      ]

      trackViewItemList(products)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'view_item_list',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: products[0]!.id.toString(),
            }),
            expect.objectContaining({
              item_id: products[1]!.id.toString(),
            }),
          ]),
        },
      })
    })

    it('should track view item list event with empty array', () => {
      const { trackViewItemList } = useProductEvents()

      trackViewItemList([])

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'view_item_list',
        ecommerce: { items: [] },
      })
    })

    it('should track view item list event with single product', () => {
      const { trackViewItemList } = useProductEvents()

      const products = [productFactory.build({ id: 10 })]

      trackViewItemList(products)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'view_item_list',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: products[0]!.id.toString(),
            }),
          ]),
        },
      })
    })
  })
})

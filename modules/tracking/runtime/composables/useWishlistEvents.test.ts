import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Factory } from 'fishery'
import type { WishlistItem } from '@scayle/storefront-nuxt'
import { productFactory } from '@scayle/storefront-nuxt/test/factories'
import { useWishlistEvents } from './useWishlistEvents'

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

const wishlistItemFactory = Factory.define<WishlistItem>(({ sequence }) => {
  return {
    key: `wishlist-item-${sequence}`,
    product: productFactory.build({ id: sequence }),
    productId: sequence,
    variantId: null,
    customData: {},
  }
})

describe('useWishlistEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('trackWishlist', () => {
    it('should track wishlist event with items', () => {
      const { trackWishlist } = useWishlistEvents()

      const items: WishlistItem[] = [
        wishlistItemFactory.build({
          productId: 123,
          product: productFactory.build({
            id: 123,
            priceRange: {
              min: {
                withTax: 2999,
                withoutTax: 2500,
              },
            },
          }),
        }),
        wishlistItemFactory.build({
          productId: 456,
          product: productFactory.build({
            id: 456,
            priceRange: {
              min: {
                withTax: 4999,
                withoutTax: 4200,
              },
            },
          }),
        }),
      ]

      trackWishlist(items)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'wishlist',
        ecommerce: { items: expect.any(Array) },
      })
    })

    it('should track wishlist event with empty array', () => {
      const { trackWishlist } = useWishlistEvents()

      trackWishlist([])

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'wishlist',
        ecommerce: { items: [] },
      })
    })

    it('should track wishlist event with undefined items', () => {
      const { trackWishlist } = useWishlistEvents()

      trackWishlist(undefined)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'wishlist',
        ecommerce: { items: [] },
      })
    })

    it('should track wishlist event with single item', () => {
      const { trackWishlist } = useWishlistEvents()

      const items: WishlistItem[] = [
        wishlistItemFactory.build({
          productId: 789,
          product: productFactory.build({
            id: 789,
            priceRange: {
              min: {
                withTax: 1999,
                withoutTax: 1600,
              },
            },
          }),
        }),
      ]

      trackWishlist(items)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'wishlist',
        ecommerce: { items: expect.any(Array) },
      })
    })
  })

  describe('trackAddToWishlist', () => {
    it('should track add to wishlist event with product', () => {
      const { trackAddToWishlist } = useWishlistEvents()

      const product = productFactory.build({ id: 1 })

      trackAddToWishlist(product)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'add_to_wishlist',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: product.id.toString(),
            }),
          ]),
        },
      })
    })

    it('should track add to wishlist event with different products', () => {
      const { trackAddToWishlist } = useWishlistEvents()

      const product1 = productFactory.build({ id: 10 })
      const product2 = productFactory.build({ id: 20 })

      trackAddToWishlist(product1)
      expect(mocks.push).toHaveBeenCalledWith({
        event: 'add_to_wishlist',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: product1.id.toString(),
            }),
          ]),
        },
      })

      vi.clearAllMocks()

      trackAddToWishlist(product2)
      expect(mocks.push).toHaveBeenCalledWith({
        event: 'add_to_wishlist',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: product2.id.toString(),
            }),
          ]),
        },
      })
    })
  })

  describe('trackRemoveFromWishlist', () => {
    it('should track remove from wishlist event with product', () => {
      const { trackRemoveFromWishlist } = useWishlistEvents()

      const product = productFactory.build({ id: 1 })

      trackRemoveFromWishlist(product)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'remove_from_wishlist',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: product.id.toString(),
            }),
          ]),
        },
      })
    })

    it('should track remove from wishlist event with different products', () => {
      const { trackRemoveFromWishlist } = useWishlistEvents()

      const product1 = productFactory.build({ id: 30 })
      const product2 = productFactory.build({ id: 40 })

      trackRemoveFromWishlist(product1)
      expect(mocks.push).toHaveBeenCalledWith({
        event: 'remove_from_wishlist',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: product1.id.toString(),
            }),
          ]),
        },
      })

      vi.clearAllMocks()

      trackRemoveFromWishlist(product2)
      expect(mocks.push).toHaveBeenCalledWith({
        event: 'remove_from_wishlist',
        ecommerce: {
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: product2.id.toString(),
            }),
          ]),
        },
      })
    })
  })
})

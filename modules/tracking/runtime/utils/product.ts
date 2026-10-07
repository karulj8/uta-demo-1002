import {
  getFirstAttributeValue,
  type Price,
  type Product,
  type Variant,
} from '@scayle/storefront-nuxt'
import type { TrackingEcommerceItem } from '../types'
import { getEcommerceCategories } from './category'
import { getEcommercePrice } from './price'
import type { OrderProduct, OrderVariant } from '#shared/types/order'
import {
  ATTRIBUTE_KEY_BRAND,
  ATTRIBUTE_KEY_NAME,
  ATTRIBUTE_KEY_SIZE,
} from '#shared/constants/attributeKeys'

/**
 * Maps a product to an ecommerce item.
 * Used in product event tracking to map products to ecommerce items.
 *
 * @example
 * ```ts
 * const product = productFactory.build()
 * const trackingItem = mapProductToTracking(product)
 * // Returns: { item_id: '123', quantity: 1, currency: 'EUR', sold_out: false, ... }
 * ```
 */
export const mapProductToTracking = (
  product: Product | OrderProduct,
): TrackingEcommerceItem => {
  const brand = getFirstAttributeValue(product.attributes, ATTRIBUTE_KEY_BRAND)
  const name = getFirstAttributeValue(product.attributes, ATTRIBUTE_KEY_NAME)

  return {
    item_id: product.id.toString(),
    quantity: 1,
    sold_out: 'isSoldOut' in product ? product.isSoldOut : undefined,
    ...getEcommerceCategories(product.categories),
    ...('priceRange' in product
      ? getEcommercePrice(product.priceRange?.min as Price)
      : {}),
    item_name: name?.label,
    item_brand: brand?.label,
    item_brand_id: brand?.id?.toString(),
  }
}

/**
 * Maps a variant to an ecommerce item.
 * Used in product event tracking to map variants to ecommerce items.
 *
 * @example
 * ```ts
 * const variant = variantFactory.build()
 * const trackingItem = mapVariantToTracking(variant)
 * // Returns: { currency: 'EUR', sold_out: false, ... }
 * ```
 */
export const mapVariantToTracking = (
  variant: Variant | OrderVariant,
): TrackingEcommerceItem => {
  const size = getFirstAttributeValue(variant?.attributes, ATTRIBUTE_KEY_SIZE)

  return {
    item_variant: variant.id.toString(),
    sold_out: variant.stock.quantity === 0,
    quantity: variant.stock.quantity,
    ...('price' in variant ? getEcommercePrice(variant.price) : {}),
    item_size: size?.label,
  }
}

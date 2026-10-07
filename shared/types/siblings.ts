import type { ProductImage, Value } from '@scayle/storefront-nuxt'

/**
 * Simplified product data for displaying color variants and siblings.
 * Used in product cards and sibling pickers to show alternative product options.
 */
export type ProductSibling = {
  /** Product identifier */
  id: number
  /** Product name */
  name: string
  /** Brand name */
  brand: string
  /** Primary product image */
  image: ProductImage | null | undefined
  /** Available color options */
  colors: Value[]
  /** Whether all variants are sold out */
  isSoldOut: boolean
}

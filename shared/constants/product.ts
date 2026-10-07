/**
 * Number of product cards displayed per row at different breakpoints.
 */
export const ProductsPerRow = {
  /** Mobile devices: 2 products per row */
  MOBILE: 2,
  /** Tablet devices: 3 products per row */
  TABLET: 3,
  /** Desktop devices: 4 products per row */
  DESKTOP: 4,
} as const

/**
 * Number of product card images to eager load for improved LCP.
 * First 8 product images load immediately, remaining images lazy load.
 */
export const PRODUCT_CARD_IMAGE_EAGER_LOAD_SIZE = 8

/**
 * Number of skeleton loaders to display while products are loading.
 */
export const PRODUCT_CARD_SKELETON_LOADERS_SIZE = 20

/**
 * Maximum number of sibling products shown in the sibling picker.
 */
export const PRODUCT_CARD_SIBLINGS_LIMIT = 4

/**
 * Cache TTL (in milliseconds) for product fetch operations.
 */
export const FETCH_PRODUCTS_CACHE_TTL = 1000

/**
 * Default number of products displayed per page in listings.
 */
export const PRODUCTS_PER_PAGE = 24

/**
 * Image quality modifier (0-100) applied to product images.
 */
export const PRODUCT_IMAGE_QUALITY_MODIFIER = '75'

/**
 * Color name to hex code mapping for filter chips.
 * Supports single colors (hex string) or multi-colors (hex array).
 */
export const ProductColor: Record<string, string | string[]> = {
  weiss_1: '#ffffff',
  beige: '#e3dad1',
  schwarz: '#000000',
  grau: '#6b7280',
  rot: '#ef4444',
  blau: '#3b82f6',
  gruen: '#22c55e',
  gelb: '#eab308',
  orange: '#f97316',
  braun: '#bfa094',
  pink: '#ec4899',
  lila: '#a855f7',
  mischfarben: ['#0000ff', '#ffa500', '#ff0000', '#008000'],
}

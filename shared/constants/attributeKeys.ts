/**
 * Attribute key for retrieving color information from product attributes.
 * Used for displaying product colors and filtering product siblings by color variants.
 * Commonly used in product cards, detail pages, and color selection components.
 */
export const ATTRIBUTE_KEY_COLOR = 'color'

/**
 * Attribute key for retrieving the product name from product attributes.
 * Used throughout the application for displaying product titles, generating URLs,
 * and creating accessible image alt text.
 */
export const ATTRIBUTE_KEY_NAME = 'name'

/**
 * Attribute key for retrieving the brand name from product attributes.
 * Used for displaying brand information on product cards, detail pages,
 * and in structured data for SEO purposes.
 */
export const ATTRIBUTE_KEY_BRAND = 'brand'

/**
 * Attribute key for retrieving storefront badge information from product attributes.
 * Used to display promotional or informational badges on product cards and tiles
 * (e.g., "New", "Sale", "Limited Edition").
 */
export const ATTRIBUTE_KEY_STOREFRONT_BADGE = 'storefrontBadge'

/**
 * Attribute key for retrieving promotion information from product attributes.
 * Used to identify which promotions are applicable to a product and display
 * promotion-related information on product cards and detail pages.
 *
 * @see https://scayle.dev/en/core-documentation/storefront-guide/developer-guide/features/promotions
 */
export const ATTRIBUTE_KEY_PROMOTION = 'promotion'

/**
 * Attribute key for identifying primary images in product image collections.
 * Used to filter and prioritize which images should be displayed first
 * on product cards and in image galleries.
 */
export const ATTRIBUTE_KEY_PRIMARY_IMAGE = 'primaryImage'

/**
 * Attribute key for retrieving the type of primary image (e.g., "model", "flat", "detail").
 * Used to display different image types based on context and allow users to switch
 * between image presentation styles on product listings.
 */
export const ATTRIBUTE_KEY_PRIMARY_IMAGE_TYPE = 'primaryImageType'

/**
 * Attribute key for retrieving size information from product attributes.
 * Used for displaying available sizes and filtering products by size options.
 */
export const ATTRIBUTE_KEY_SIZE = 'size'

/**
 * Attribute key for retrieving product description from product attributes.
 * Used to display detailed product information on product detail pages.
 */
export const ATTRIBUTE_KEY_DESCRIPTION = 'description'

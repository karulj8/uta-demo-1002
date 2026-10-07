import { getAttributeValue, type ProductImage } from '@scayle/storefront-nuxt'

/**
 * Retrieves the primary product image with optional type preference.
 * Used in product cards, PDPs, and sibling displays.
 *
 * **Selection priority:**
 * 1. Image matching `preferredPrimaryImageType` (if provided)
 * 2. Image marked with `primaryImage` attribute
 * 3. First image in the array
 *
 * @param images - Array of product images
 * @param preferredPrimaryImageType - Optional image type to prioritize (e.g., 'model', 'product')
 *
 * @returns Primary image or undefined if array is empty
 *
 * @example
 * ```ts
 * getPrimaryImage(product.images, 'model')
 * getPrimaryImage(product.images) // Uses primaryImage attribute
 * ```
 */
export const getPrimaryImage = (
  images: ProductImage[],
  preferredPrimaryImageType?: string,
) => {
  if (preferredPrimaryImageType) {
    const imageByType = images.find(
      (img) => getImageType(img) === preferredPrimaryImageType,
    )

    if (imageByType) {
      return imageByType
    }
  }

  return images.find((img) => isPrimaryImage(img)) ?? images[0]
}

/** Checks if image has `primaryImage` attribute. */
const isPrimaryImage = (image: ProductImage) => {
  return 'primaryImage' in (image.attributes ?? {})
}

/** Extracts `primaryImageType` attribute value from image. */
const getImageType = (image: ProductImage) => {
  if (!('primaryImageType' in (image.attributes ?? {}))) {
    return undefined
  }
  return getAttributeValue(image.attributes, 'primaryImageType')
}

/**
 * Sorts product images with primary and type-based prioritization.
 * Used in product galleries to display images in the correct order.
 *
 * **Sort priority:**
 * 1. Images matching `preferredPrimaryImageType` (if provided)
 * 2. Images marked with `primaryImage` attribute
 * 3. Remaining images in original order
 *
 * @param images - Array of product images to sort
 * @param preferredPrimaryImageType - Optional image type to prioritize
 *
 * @returns New sorted array (original array unchanged)
 *
 * @example
 * ```ts
 * sortProductImages(product.images, 'model') // Model shots first
 * sortProductImages(product.images) // Primary images first
 * ```
 */
export const sortProductImages = (
  images: ProductImage[],
  preferredPrimaryImageType?: string,
) => {
  return images.toSorted((imageA, imageB) => {
    const isImageAPrimary = isPrimaryImage(imageA)
    const imageTypeA = getImageType(imageA)
    const isImageBPrimary = isPrimaryImage(imageB)
    const imageTypeB = getImageType(imageB)

    // Prioritize images with matching type if `preferredPrimaryImageType` is provided
    if (preferredPrimaryImageType) {
      const aIsType = imageTypeA === preferredPrimaryImageType
      const bIsType = imageTypeB === preferredPrimaryImageType
      if (aIsType && !bIsType) {
        return -1
      }
      if (!aIsType && bIsType) {
        return 1
      }
    }

    // Both are primary or both are not primary
    if (isImageAPrimary && isImageBPrimary) {
      return 0
    }

    // Only B is primary
    if (isImageBPrimary) {
      return 1
    }

    // Only A is primary
    if (isImageAPrimary) {
      return -1
    }

    // Neither is primary
    return 0
  })
}

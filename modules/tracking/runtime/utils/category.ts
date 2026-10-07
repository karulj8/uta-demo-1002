import type { ProductCategory } from '@scayle/storefront-nuxt'
import type { TrackingEcommerceItem } from '../types/tracking'

/**
 * Extracts up to 5 categories from the last array in a nested array of product categories.
 * Used in basket item mapping to populate item_category, item_category2, and item_category3 fields.
 *
 * @param categories - Nested array of product categories (ProductCategory[][])
 * @returns Array of up to 5 categories with their names and IDs from the last array
 *
 * @example
 * ```ts
 * const categories = extractCategories(basketItem.product.categories)
 * // For categories = [[cat1, cat2], [cat3, cat4, cat5]]
 * // Returns: [{ name: 'Category 3', id: '3' }, { name: 'Category 4', id: '4' }, { name: 'Category 5', id: '5' }]
 * ```
 */
const extractCategories = (
  categories?: ProductCategory[][],
): Array<{ name: string; id: string }> => {
  return (categories?.at(-1) ?? []).slice(0, 5).map((category) => ({
    name: category.categoryName,
    id: category.categoryId.toString(),
  }))
}

/**
 * Extracts the names of up to 5 categories from a nested array of product categories.
 * Used in product mapping to populate item_category, item_category2, and item_category3 fields.
 *
 * @param categories - Nested array of product categories (ProductCategory[][])
 * @returns Array of up to 3 category names
 */
export const getEcommerceCategories = (
  categories?: ProductCategory[][],
): Pick<
  TrackingEcommerceItem,
  | 'item_category'
  | 'item_category_id'
  | 'item_category2'
  | 'item_category2_id'
  | 'item_category3'
  | 'item_category3_id'
  | 'item_category4'
  | 'item_category4_id'
  | 'item_category5'
  | 'item_category5_id'
> => {
  const categoriesData = extractCategories(categories)

  return {
    item_category: categoriesData[0]?.name,
    item_category_id: categoriesData[0]?.id,
    item_category2: categoriesData[1]?.name,
    item_category2_id: categoriesData[1]?.id,
    item_category3: categoriesData[2]?.name,
    item_category3_id: categoriesData[2]?.id,
    item_category4: categoriesData[3]?.name,
    item_category4_id: categoriesData[3]?.id,
    item_category5: categoriesData[4]?.name,
    item_category5_id: categoriesData[4]?.id,
  }
}

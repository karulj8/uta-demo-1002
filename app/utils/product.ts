import {
  type Promotion,
  type Price,
  type Product,
  getAttributeValueTuples,
  getFirstAttributeValue,
  getAttributeValuesByGroupId,
  type ProductImage,
  type Value,
  type BasketItem,
  type ApplicablePromotion,
  type BuyXGetYEffect,
} from '@scayle/storefront-nuxt'
import { getPrimaryImage } from './image'
import type { BasketItemPrice } from '#storefront/composables'
import type { ProductSibling } from '#shared/types/siblings'
import {
  isBuyXGetYType,
  isGiftConditionMet,
  sortPromotionsByPriority,
} from '#storefront-promotions/utils'
import { getVariantIds } from '#storefront-promotions/utils/promotion'
import {
  ATTRIBUTE_KEY_BRAND,
  ATTRIBUTE_KEY_NAME,
  ATTRIBUTE_KEY_PRIMARY_IMAGE_TYPE,
} from '#shared/constants/attributeKeys'

export { ProductImageType } from '@scayle/storefront-nuxt'

/**
 * Extracts promotion attribute values from product attributes.
 * Returns promotion IDs configured for the product in SCAYLE Panel.
 *
 * @param product - Product to extract promotions from
 *
 * @returns Array of promotion attribute values or empty array
 *
 * @example
 * ```ts
 * const promotions = getPromotionsFromProductAttributes(product)
 * // Returns promotion attribute tuples with id/label
 * ```
 */
export const getPromotionsFromProductAttributes = (product?: Product) => {
  if (!product) {
    return []
  }
  return getAttributeValueTuples(product.attributes, 'promotion') || []
}

/**
 * Filters active promotions that match product's promotion attributes.
 * Matches by promotion attribute ID and returns sorted by priority.
 *
 * @param product - Product to get promotions for
 * @param promotions - List of currently active promotions
 *
 * @returns Sorted array of matching promotions
 *
 * @example
 * ```ts
 * // Used internally by getPromotionsForProductDetailPage
 * const matching = getPromotionsForProduct(product, activePromotions)
 * ```
 */
export const getPromotionsForProduct = (
  product: Product,
  promotions: Promotion[],
): Promotion[] => {
  // We filter all available promotions that are configured for the product
  // The attribute to detect the promotion depends on the configured `attributeGroupId`.
  const items = promotions.filter(({ customData }) => {
    if (
      !customData?.product?.attributeId ||
      !customData.product?.attributeGroupId
    ) {
      return false
    }

    return getAttributeValuesByGroupId(
      product.attributes,
      customData.product?.attributeGroupId,
    ).some((value) => value.id === customData.product?.attributeId)
  })

  return items.toSorted(sortPromotionsByPriority) || []
}

/**
 * Transforms product into simplified sibling data structure.
 * Extracts essential product info for sibling display (name, brand, image, colors).
 *
 * @param product - Product to transform (destructured)
 * @param colorAttributeName - Attribute key for color data (defaults to 'colorDetail')
 *
 * @returns Simplified product data for sibling display
 *
 * @example
 * ```ts
 * // Used internally by getProductSiblings
 * const siblingData = getProductSiblingData(product, 'color')
 * ```
 */
export const getProductSiblingData = (
  { id, images, attributes, isSoldOut }: Product,
  colorAttributeName = 'colorDetail',
): ProductSibling => ({
  id,
  name: getFirstAttributeValue(attributes, ATTRIBUTE_KEY_NAME)?.label ?? '',
  brand: getFirstAttributeValue(attributes, ATTRIBUTE_KEY_BRAND)?.label ?? '',
  image: getPrimaryImage(images) ?? images[0],
  colors: getAttributeValueTuples(attributes, colorAttributeName),
  isSoldOut,
})

/**
 * Retrieves product siblings with optional filtering and sorting.
 * Used in sibling picker components to show alternative product options.
 *
 * @param product - Product to get siblings for
 * @param colorAttributeName - Attribute key for color data (defaults to `'colorDetail'`)
 * @param options - Configuration options
 * @param options.omitSoldOut - Exclude sold out siblings (defaults to `false`)
 * @param options.includeCurrentProduct - Include current product in results (defaults to `true`)
 * @param options.sortBySoldOut - Sort sold out items to end (defaults to `false`)
 *
 * @returns Array of product siblings
 *
 * @example
 * ```ts
 * // Used in product base info composable
 * const siblings = getProductSiblings(product, 'color', {
 *   sortBySoldOut: true
 * })
 *
 * const nonSoldOutSiblings = getProductSiblings(product, 'color', {
 *   omitSoldOut: true
 * })
 * ```
 */
export const getProductSiblings = (
  product?: Product | null,
  colorAttributeName = 'colorDetail',
  options: {
    omitSoldOut?: boolean
    includeCurrentProduct?: boolean
    sortBySoldOut?: boolean
  } = {},
): ProductSibling[] => {
  if (!product) {
    return []
  }

  const {
    omitSoldOut = false,
    includeCurrentProduct = true,
    sortBySoldOut = false,
  } = options
  const siblingItems =
    product?.siblings?.filter(({ isActive }) => {
      return omitSoldOut ? isActive : true
    }) ?? []

  const items = siblingItems.map((item) =>
    getProductSiblingData(item, colorAttributeName),
  )

  if (sortBySoldOut) {
    items.sort((a, b) => {
      const soldOutOrder = a.isSoldOut ? 1 : -1

      return a.isSoldOut === b.isSoldOut ? 0 : soldOutOrder
    })
  }

  return includeCurrentProduct
    ? [getProductSiblingData(product, colorAttributeName), ...items]
    : items
}

/**
 * Creates price object with merged overwrite properties.
 * Used for price customization in promotions and discounts.
 *
 * @template T - Price type (`Price` or `BasketItemPrice`)
 * @param price - Original price object
 * @param overwrite - Properties to merge/override
 *
 * @returns New price object with merged properties
 *
 * @example
 * ```ts
 * const customPrice = createCustomPrice(originalPrice, {
 *   withTax: 2999,
 *   appliedReductions: [...newReductions]
 * })
 * ```
 */
export const createCustomPrice = <T = Price | BasketItemPrice>(
  price: T,
  overwrite: Partial<T>,
): T => {
  return {
    ...price,
    ...overwrite,
  }
}

/**
 * Calculates maximum selectable quantity for product/variant.
 * Caps at 10 items to prevent basket API errors.
 *
 * @param stockQuantity - Available stock quantity
 *
 * @returns Maximum quantity between 0 and 10
 *
 * @example
 * ```ts
 * getMaxQuantity(100) // 10 (capped)
 * getMaxQuantity(5)   // 5
 * getMaxQuantity(0)   // 0
 * ```
 */
export const getMaxQuantity = (stockQuantity?: number) =>
  Math.max(Math.min(stockQuantity ?? 1, 10), 0)

/**
 * Extracts unique primary image types from product list.
 * Used in category pages for image type filter options.
 *
 * @param products - Products to extract image types from
 *
 * @returns Array of distinct image type values
 *
 * @example
 * ```ts
 * // Used on category page to get filter options
 * const imageTypes = getDistinctPrimaryImageTypes(categoryProducts)
 * // Returns: [{ id: 1, label: 'Model' }, { id: 2, label: 'Product' }]
 * ```
 */
export const getDistinctPrimaryImageTypes = (products: Product[]) => {
  return Array.from(
    products
      .flatMap((product: Product) => {
        return product.images.filter((img: ProductImage) => {
          return !!img.attributes?.primaryImageType
        })
      })
      .reduce<Map<number, Value>>((acc, img) => {
        const value = getFirstAttributeValue(
          img.attributes,
          ATTRIBUTE_KEY_PRIMARY_IMAGE_TYPE,
        )
        if (value && value.id) {
          acc.set(value.id, value)
        }
        return acc
      }, new Map<number, Value>())
      .values(),
  )
}

/**
 * Checks if price includes campaign reduction.
 * Used on PDP to conditionally display campaign banners.
 *
 * @param price - Price object to check
 *
 * @returns Campaign reduction object if found, undefined otherwise
 *
 * @example
 * ```ts
 * // Used on PDP to show campaign banner only when reduction applies
 * if (campaign && hasCampaignReduction(price)) {
 *   // Display SFDealBanner for campaign
 * }
 * ```
 */
export const hasCampaignReduction = (price?: Price) => {
  return price?.appliedReductions.find(
    (reduction) => reduction.category === 'campaign',
  )
}

/**
 * Aggregates product and basket item promotions for PDP display.
 * Merges product-specific promotions with basket item promotions,
 * de-duplicates by ID, and sorts by priority.
 *
 * @param product - Product to get promotions for
 * @param currentPromotions - List of all active promotions
 * @param basketItem - Optional basket item with applied promotions
 *
 * @returns Unique array of promotions sorted by priority
 *
 * @example
 * ```ts
 * // Used on PDP to show all applicable promotions
 * const promotions = getPromotionsForProductDetailPage(
 *   product,
 *   promotionData.entities,
 *   basketItem
 * )
 * // Used to display deal banners and progress bars
 * ```
 */
export function getPromotionsForProductDetailPage(
  product: Product | null,
  currentPromotions: Promotion[] = [],
  basketItem?: BasketItem,
): Promotion[] {
  if (!product) {
    return []
  }

  const productPromotions = getPromotionsForProduct(product, currentPromotions)

  if (basketItem) {
    const basketPromotions = basketItem?.promotions ?? []

    const combined = [...basketPromotions, ...productPromotions]
    const uniquePromotions = combined.reduce<Promotion[]>((acc, promotion) => {
      if (!acc.find((p) => p.id === promotion.id)) {
        acc.push(promotion)
      }
      return acc
    }, [])

    return uniquePromotions.toSorted(sortPromotionsByPriority)
  }

  return productPromotions
}

/**
 * Checks if promotion is Buy X Get X (same product as gift).
 * These promotions discount/free the purchased product itself.
 *
 * @param promotion - Buy X Get Y promotion to check
 *
 * @returns `true` if promotion gives same product as gift, `false` otherwise
 */
export function isBuyXGetX(promotion: Promotion<BuyXGetYEffect>) {
  return (
    promotion.effect.additionalData.applicableItemSelectionType !==
      'variant_ids' && getVariantIds(promotion) === undefined
  )
}

/**
 * Selects highest-priority single Buy X Get Y promotion for PDP.
 * Filters for eligible buyXGetY promotions with met gift conditions
 * and variant IDs (excludes Buy X Get X).
 *
 * @param promotions - Promotions to evaluate
 * @param applicablePromotions - Basket-applied promotions for condition checking
 *
 * @returns Highest-priority buyXGetY promotion or undefined
 *
 * @example
 * ```ts
 * // Used on PDP to display gift selection modal
 * const buyXGetYPromotion = getBuyXGetYPromotionForProductDetailPage(
 *   promotions,
 *   basket.applicablePromotions
 * )
 * if (buyXGetYPromotion) {
 *   // Show SFBuyXGetYProducts component
 * }
 * ```
 */
export function getBuyXGetYPromotionForProductDetailPage(
  promotions: Promotion[],
  applicablePromotions?: ApplicablePromotion[],
): Promotion<BuyXGetYEffect> | undefined {
  if (!promotions.length) {
    return
  }

  const buyXGetYPromotions = promotions.filter((promotion) => {
    if (!promotion) {
      return false
    }
    return (
      isBuyXGetYType(promotion) &&
      isGiftConditionMet(promotion, applicablePromotions) &&
      !isBuyXGetX(promotion)
    )
  })

  return buyXGetYPromotions.toSorted(
    sortPromotionsByPriority,
  )[0] as Promotion<BuyXGetYEffect>
}

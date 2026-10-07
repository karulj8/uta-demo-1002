import type {
  AppliedReduction,
  CentAmount,
  Price,
} from '@scayle/storefront-nuxt'
import type { TrackingEcommerceItem } from '../types'
import type { BasketItemPrice } from '#storefront/composables'
import type { OrderPrice } from '#shared/types/order'

/**
 * Extracts the sale discount amount from applied reductions.
 * Used in price mapping to populate sale_discount_with_tax field.
 *
 * @param appliedReductions - Array of applied price reductions
 * @returns Sale discount amount in cents, or undefined if no sale reduction found
 */
export function getSalePriceFromAppliedReductions(
  appliedReductions: AppliedReduction[],
): CentAmount | undefined {
  return appliedReductions.find((reduction) => reduction.category === 'sale')
    ?.amount.absoluteWithTax
}

/**
 * Calculates the original price before any reductions were applied.
 * Used internally to determine the base price for discount calculations.
 *
 * @param price - Price object with applied reductions
 * @returns Original price in cents before reductions
 */
const getOriginalPrice = (price: Price): CentAmount =>
  (price.appliedReductions ?? []).reduce(
    (previousPrice, appliedReduction) =>
      (previousPrice + appliedReduction.amount.absoluteWithTax) as CentAmount,
    price.withTax,
  )

/**
 * Extracts the campaign discount amount from applied reductions.
 * Used in price mapping to populate campaign_discount_with_tax field.
 *
 * @param appliedReductions - Array of applied price reductions
 * @returns Campaign discount amount in cents, or undefined if no campaign reduction found
 */
export function getCampaignPriceFromAppliedReductions(
  appliedReductions: AppliedReduction[],
): CentAmount | undefined {
  return appliedReductions.find(
    (reduction) => reduction.category === 'campaign',
  )?.amount.absoluteWithTax
}

/**
 * Extracts the promotion discount amount from applied reductions.
 * Used in price mapping to populate promotion_discount_with_tax field.
 *
 * @param appliedReductions - Array of applied price reductions
 * @returns Promotion discount amount in cents, or undefined if no promotion reduction found
 */
export function getPromotionPriceFromAppliedReductions(
  appliedReductions: AppliedReduction[],
): CentAmount | undefined {
  return appliedReductions.find(
    (reduction) => reduction.category === 'promotion',
  )?.amount.absoluteWithTax
}

/**
 * Converts price from cents to currency units.
 * Used in price mapping to format tracking prices for ecommerce events.
 *
 * @param price - Price in cents
 * @returns Price in currency units, or undefined if price is not provided
 */
export const formatPrice = (
  price?: CentAmount | number,
): CentAmount | undefined => {
  return price ? ((price / 100) as CentAmount) : undefined
}

/**
 * Maps a price object to ecommerce tracking item price fields.
 * Used in product, variant, and basket item mapping to populate price-related tracking data.
 *
 * @param price - Price or basket item price object with applied reductions
 * @returns Object containing formatted price fields for ecommerce tracking
 *
 * @example
 * ```ts
 * const priceData = getEcommercePrice(variant.price)
 * // Returns: { price_with_tax: 29.99, original_price_with_tax: 39.99, sale_discount_with_tax: 10.00, ... }
 * ```
 */
export function getEcommercePrice(
  price: Price | BasketItemPrice | OrderPrice,
): Pick<
  TrackingEcommerceItem,
  | 'price_with_tax'
  | 'original_price_with_tax'
  | 'sale_discount_with_tax'
  | 'campaign_discount_with_tax'
  | 'promotion_discount_with_tax'
  | 'tax'
  | 'currency'
> {
  const saleDiscount = getSalePriceFromAppliedReductions(
    price.appliedReductions ?? [],
  )
  const campaignDiscount = getCampaignPriceFromAppliedReductions(
    price.appliedReductions ?? [],
  )
  const promotionDiscount = getPromotionPriceFromAppliedReductions(
    price.appliedReductions ?? [],
  )

  const originalPrice = getOriginalPrice(price as Price)

  return {
    price_with_tax: formatPrice(price.withTax),
    original_price_with_tax: formatPrice(originalPrice),
    sale_discount_with_tax: formatPrice(saleDiscount),
    campaign_discount_with_tax: formatPrice(campaignDiscount),
    promotion_discount_with_tax: formatPrice(promotionDiscount),
    tax: 'tax' in price ? formatPrice(price.tax.vat.amount) : undefined,
    currency: 'currencyCode' in price ? price.currencyCode : undefined,
  }
}

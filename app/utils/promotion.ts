import type { Campaign, Promotion } from '@scayle/storefront-nuxt'
import Color from 'color'
import { theme } from '#tailwind-config'
import type { DealDisplayData } from '#shared/types/promotion'

/** Converts color and alpha to RGBA string. */
const getRGBAValue = (color: string, alpha: AlphaValue) =>
  Color(color)
    .alpha(alpha / 100)
    .rgb()
    .string()

/** Default promotion color from theme. */
export const FALLBACK_COLOR = theme.colors.promotion

/** Default color scheme for promotions. */
export const FALLBACK_PROMOTION_COLORS = {
  background: FALLBACK_COLOR,
  text: theme.colors.primary,
}

/** Default color scheme for campaigns. */
export const FALLBACK_CAMPAIGN_COLORS = {
  background: theme.colors.campaign,
  text: theme.colors.primary,
}

/** Opacity percentage values for color transparency. */
type AlphaValue = 0 | 5 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100

/**
 * Color styling for promotions and campaigns with background and text colors.
 */
export type PromotionStyle =
  | {
      textColor: string
      backgroundColor: string
      color?: string
    }
  | {
      textColor?: string
      backgroundColor: string
      color: string
    }

/**
 * Generates background color style with optional transparency.
 *
 * @param color - Hex color string used for the background (defaults to fallback promotion color)
 * @param alpha - Opacity percentage (0-100, optional)
 *
 * @returns Object with `backgroundColor` property
 *
 * @example
 * ```ts
 * getBackgroundColorStyle('#ff0000') // { backgroundColor: '#FF0000' }
 * getBackgroundColorStyle('#ff0000', 50) // { backgroundColor: 'rgba(255, 0, 0, 0.5)' }
 * ```
 */
export const getBackgroundColorStyle = (
  color?: string | unknown,
  alpha?: AlphaValue,
): { backgroundColor: string } => {
  const colorHex = Color(color ?? FALLBACK_COLOR).hex()

  return {
    backgroundColor:
      alpha !== undefined ? getRGBAValue(colorHex, alpha) : colorHex,
  }
}

/**
 * Generates text color style with optional transparency.
 *
 * @param color - Hex color string for text (defaults to fallback promotion color)
 * @param alpha - Opacity percentage (0-100, optional)
 *
 * @returns Object with color property
 *
 * @example
 * ```ts
 * getTextColorStyle('#ff0000') // { color: '#FF0000' }
 * getTextColorStyle('#ff0000', 80) // { color: 'rgba(255, 0, 0, 0.8)' }
 * ```
 */
export const getTextColorStyle = (
  color?: string | unknown,
  alpha?: AlphaValue,
) => {
  const colorHex = Color(color ?? FALLBACK_COLOR).hex()
  return {
    color: alpha !== undefined ? getRGBAValue(colorHex, alpha) : colorHex,
  }
}

/**
 * Extracts color styling from promotion custom data.
 * Used for deal badges, banners, and ribbons throughout the Storefront Application.
 *
 * @param promotion - Promotion with optional custom color configuration
 *
 * @returns Color style object with background and text colors
 *
 * @example
 * ```ts
 * // Used in deal badge component
 * const style = getPromotionStyle(promotion)
 * // Returns custom colors or fallback promotion colors
 * ```
 */
export const getPromotionStyle = (
  promotion?: Promotion | null,
): PromotionStyle => {
  if (!promotion) {
    return {
      backgroundColor: FALLBACK_PROMOTION_COLORS.background,
      color: FALLBACK_PROMOTION_COLORS.text,
    }
  }

  return {
    backgroundColor:
      promotion.customData?.color?.background ||
      FALLBACK_PROMOTION_COLORS.background,
    color: promotion.customData?.color?.text || FALLBACK_PROMOTION_COLORS.text,
  }
}

/**
 * Extracts color styling from campaign configuration.
 * Used for deal badges, banners, and ribbons throughout the Storefront Application.
 *
 * @param campaign - Campaign with optional color configuration
 *
 * @returns Color style object with background and text colors
 *
 * @example
 * ```ts
 * // Used in deal ribbon component
 * const style = getCampaignStyle(campaign)
 * // Returns custom colors or fallback campaign colors
 * ```
 */
export const getCampaignStyle = (
  campaign?: Campaign | null,
): PromotionStyle => {
  if (!campaign) {
    return {
      backgroundColor: FALLBACK_CAMPAIGN_COLORS.background,
      color: FALLBACK_CAMPAIGN_COLORS.text,
    }
  }

  return {
    backgroundColor:
      campaign?.color?.background || FALLBACK_CAMPAIGN_COLORS.background,
    color: campaign?.color?.text || FALLBACK_CAMPAIGN_COLORS.text,
  }
}

/**
 * Normalizes promotion to include tiers array.
 * Converts `minimumOrderValue` from custom data into a tier if needed.
 *
 * @param promotion - Promotion to normalize and ensure it has a `tiers` array
 *
 * @returns Promotion with guaranteed tiers array (may be empty)
 *
 * @example
 * ```ts
 * // Promotion with existing tiers - returns as-is
 * getTieredPromotion(tieredPromotion) // { ...promotion, tiers: [...] }
 *
 * // Promotion with MOV - creates tier from minimumOrderValue
 * getTieredPromotion(movPromotion) // { ...promotion, tiers: [{ mov: 5000, ... }] }
 *
 * // Standard promotion - returns with empty tiers
 * getTieredPromotion(standardPromotion) // { ...promotion, tiers: [] }
 * ```
 */
export function getTieredPromotion(
  promotion: Promotion,
): Promotion & Required<Pick<Promotion, 'tiers'>> {
  if (promotion.tiers?.length) {
    return promotion as Promotion & Required<Pick<Promotion, 'tiers'>>
  } else if (promotion.customData.minimumOrderValue) {
    return {
      ...promotion,
      tiers: [
        {
          effect: promotion.effect,
          id: 1,
          name: 'mov',
          mov: promotion.customData.minimumOrderValue,
        },
      ],
    }
  } else {
    return {
      ...promotion,
      tiers: [],
    }
  }
}

/**
 * Checks if promotion has pricing tiers or minimum order value.
 * Used to determine if progress bars should be displayed on PDP.
 *
 * @param promotion - Promotion to check
 *
 * @returns `true` if promotion has tiers or MOV, `false` otherwise
 *
 * @example
 * ```ts
 * // Used in PDP to conditionally render progress wrapper
 * if (isTieredPromotion(promotion)) {
 *   // Show SFPromotionProgressWrapper component
 * }
 * ```
 */
export function isTieredPromotion(promotion: Promotion): boolean {
  return !!getTieredPromotion(promotion).tiers.length
}

/**
 * Transforms promotion into normalized display data for UI components.
 * Used in deal banners, ribbons, and badges across PDP and layout.
 *
 * @param promotion - Promotion from SCAYLE API
 *
 * @returns Normalized display data with headline, colors, countdown, etc.
 *
 * @example
 * ```ts
 * // Used in PDP deal banner
 * const displayData = getPromotionDisplayData(promotion)
 * <SFDealBanner :display-data="displayData" />
 *
 * // Used in layout deal ribbon
 * const ribbonData = getPromotionDisplayData(highestPriorityPromotion)
 * ```
 */
export function getPromotionDisplayData(promotion: Promotion): DealDisplayData {
  return {
    id: promotion.id,
    name: promotion.name,
    headline: promotion.displayName || promotion.name,
    subline: promotion.customData.subline,
    link: promotion.customData.link,
    hideCountdown: promotion.customData.hideCountdown || false,
    colorStyle: getPromotionStyle(promotion),
    conditions: promotion.customData.conditions,
    expirationDate: promotion.schedule.to,
  }
}

/**
 * Transforms campaign into normalized display data for UI components.
 * Used in deal banners, ribbons, and badges across PDP and layout.
 *
 * @param campaign - Campaign to use for determining the display data.
 *
 * @returns Normalized display data with headline, colors, countdown, etc.
 *
 * @example
 * ```ts
 * // Used in PDP deal banner for campaigns
 * const displayData = getCampaignDisplayData(campaign)
 * <SFDealBanner :display-data="displayData" />
 *
 * // Used in layout deal ribbon for campaigns
 * const ribbonData = getCampaignDisplayData(activeCampaign)
 * ```
 */
export function getCampaignDisplayData(campaign: Campaign): DealDisplayData {
  return {
    id: campaign.id.toString(),
    name: campaign.name,
    headline: campaign.headline || campaign.name,
    subline: campaign.subline,
    link: campaign.link,
    hideCountdown: campaign.hideCountdown || false,
    colorStyle: getCampaignStyle(campaign),
    conditions: campaign.condition,
    expirationDate: campaign.endsAt,
  }
}

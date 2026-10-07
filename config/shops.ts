import type { LocaleObject } from "@nuxtjs/i18n";

type LocaleCode = LocaleObject['code']

/**
 * Configuration for a shop and its locale settings.
 *
 * @typedef ShopAndLocaleConfig
 * @property locale - A BCP-47 format locale code (e.g. 'de-DE').
 * @property code - A unique identifying code for the shop/locale.
 *   Also used to create the shop's default path prefix (e.g. 'de').
 * @property shopId - The shop's unique identifier.
 * @property currency - The ISO 4217 currency code for the shop (e.g. 'EUR').
 * @property isDefault - Flags the current shop as the default.
 *   - With `path` selection, the default shop will be redirected to when loading the base route.
 *   - With `path_or_default` selection, the default shop will use the base route itself.
 * @property translationFile - The file with the translations to load for the shop/locale (relative to /langs).
 */
interface ShopAndLocaleConfig {
  locale: string
  code: LocaleCode | LocaleCode[]
  shopId: number
  currency: string
  isDefault: boolean
  translationFile: string
  countryCode: string
}

/**
 * List of configurations to be used to define the `shops` list for `storefront-nuxt` and `locales` for `nuxt-i18n`
 */
export const shops: ShopAndLocaleConfig[] = [
  {
    locale: "en-US",
    code: "us",
    shopId: 1074,
    currency: "USD",
    isDefault: true,
    translationFile: "en_US.json",
    countryCode: "US"
  }
]
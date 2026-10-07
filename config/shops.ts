import type { LocaleObject } from '@nuxtjs/i18n'

/** Locale code from i18n configuration. */
type LocaleCode = LocaleObject['code']

/**
 * Shop and locale configuration for multi-shop storefronts.
 * Defines routing, currency, translations, and regional settings per shop.
 */
interface ShopAndLocaleConfig {
  /** BCP-47 locale code (e.g., 'de-DE', 'en-US') */
  locale: string
  /** URL path prefix(es) for the shop (e.g., 'de' or ['en', 'en-us']) */
  code: LocaleCode | LocaleCode[]
  /** SCAYLE shop identifier */
  shopId: number
  /** ISO 4217 currency code (e.g., 'EUR', 'USD') */
  currency: string
  /**
   * Whether this shop is the default for routing.
   * With `path` selection the default shop will be redirected to when loading the base route.
   * With `path_or_default` selection the default shop will use the base route itself
   */
  isDefault: boolean
  /** Translation file path relative to `/i18n/locales/` */
  translationFile: string
  /** ISO 3166-1 alpha-2 country code for regional detection */
  countryCode: string

  /**
   * Indicates if the shop requires consent management for third party services.
   * If true, the shop will require the user to consent to the use of third party services.
   * If false, the shop will not require the user to consent to the use of third party services.
   * This is used to determine if the consent management module should be enabled for the shop.
   * @default false
   */
  requiresConsentManagement?: boolean
}

/**
 * Shop configurations for country shops within the Storefront Application and i18n routing.
 * Used to generate shop routes, i18n locales, and regional settings.
 */
export const shops: [ShopAndLocaleConfig, ...ShopAndLocaleConfig[]] = [
  {
    locale: 'de-DE',
    code: 'de',
    shopId: 1918,
    currency: 'EUR',
    isDefault: true,
    translationFile: 'de_DE.json',
    countryCode: 'DE',
    requiresConsentManagement: true,
  },
  {
    locale: 'en-US',
    code: ['en', 'en-us'],
    shopId: 1919,
    currency: 'USD',
    isDefault: false,
    translationFile: 'en_GB.json',
    countryCode: 'US',
  },
  {
    locale: 'de-CH',
    code: 'ch',
    shopId: 1920,
    currency: 'CHF',
    isDefault: false,
    translationFile: 'de_DE.json',
    countryCode: 'CH',
    requiresConsentManagement: false,
  },
  {
    locale: 'de-AT',
    code: 'at',
    shopId: 1921,
    currency: 'EUR',
    isDefault: false,
    translationFile: 'de_DE.json',
    countryCode: 'AT',
    requiresConsentManagement: true,
  },
  {
    locale: 'en-DE',
    code: 'de-en',
    shopId: 1965,
    currency: 'EUR',
    isDefault: false,
    translationFile: 'en_GB.json',
    countryCode: 'DE',
    requiresConsentManagement: true,
  },
  {
    locale: 'hr-HR',
    code: 'hr',
    shopId: 2002,
    currency: 'EUR',
    isDefault: false,
    translationFile: 'en_GB.json',
    countryCode: 'HR',
    requiresConsentManagement: true,
  },
]

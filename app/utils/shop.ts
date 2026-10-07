import type { PublicShopConfig } from '@scayle/storefront-nuxt'

/**
 * Formats shop locale into human-readable country name.
 * Used in shop switcher to display current shop. Optionally appends language code
 * when multiple shops exist for the same country.
 *
 * @param locale - BCP-47 locale code (e.g., 'de-DE', 'en-US')
 * @param includeLanguage - Whether to append language code (e.g., 'Germany | EN')
 *
 * @returns Localized country name, optionally with language code
 *
 * @example
 * ```ts
 * getShopName('de-DE') // 'Deutschland' (localized to German)
 * getShopName('en-DE') // 'Germany' (localized to English)
 * getShopName('en-DE', true) // 'Germany | EN'
 *
 * // Used in shop switcher
 * const displayName = getShopName(
 *   currentShop.locale,
 *   hasMultipleShopsForCountry(availableShops)
 * )
 * ```
 */
export function getShopName(
  locale: string,
  includeLanguage: boolean = false,
): string | undefined {
  const [languageCode, regionCode] = locale.split('-') as [string, string]

  const region = new Intl.DisplayNames([locale], {
    type: 'region',
  }).of(regionCode)

  return includeLanguage ? `${region} | ${languageCode.toUpperCase()}` : region
}

/**
 * Checks if any country has multiple shop configurations.
 * Used to determine if shop switcher should display language codes alongside country names.
 *
 * @param shops - List of shop configurations to check
 *
 * @returns `true` if any country appears in multiple shops, `false` otherwise
 *
 * @example
 * ```ts
 * const shops = [
 *   { locale: 'en-DE' },  // Germany - English
 *   { locale: 'de-DE' },  // Germany - German
 *   { locale: 'en-US' }   // USA - English
 * ]
 * hasMultipleShopsForCountry(shops) // true (DE appears twice)
 *
 * // Used in shop switcher to show language codes when needed
 * const showLanguage = hasMultipleShopsForCountry(availableShops)
 * const name = getShopName(shop.locale, showLanguage)
 * ```
 */
export function hasMultipleShopsForCountry(
  shops: Pick<PublicShopConfig, 'locale'>[],
): boolean {
  const counts = shops.reduce(
    (acc, shop) => {
      const [, countryCode] = shop.locale.split('-') as [string, string]
      acc[countryCode] = (acc[countryCode] ?? 0) + 1

      return acc
    },
    {} as Record<string, number>,
  )

  return Object.values(counts).some((count) => count > 1)
}

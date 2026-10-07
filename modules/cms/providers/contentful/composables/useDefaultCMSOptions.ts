import { useCurrentShop } from '#storefront/composables'

/**
 * Provides default query options for Contentful CMS requests.
 *
 * This composable returns an object containing the current shop's locale,
 * which is automatically included in all Contentful API queries to fetch
 * localized content appropriate for the user's shop configuration.
 *
 * @returns An object with the following properties:
 * - `locale`: The current shop's locale code (e.g., 'en-US', 'de-DE')
 *
 * @example
 * ```ts
 * // Real-world usage from useCMSBySlug composable
 * const defaultCMSOptions = useDefaultCMSOptions()
 * const queryValue = toValue(query)
 *
 * // Fetch content with the shop's configured locale
 * return await fetchEntry({
 *   ...defaultCMSOptions,
 *   ...queryValue,
 * })
 * ```
 */
export function useDefaultCMSOptions() {
  const currentShop = useCurrentShop()

  return {
    locale: currentShop.value.locale ?? '',
  } as const
}

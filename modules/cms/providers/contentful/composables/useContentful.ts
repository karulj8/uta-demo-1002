import type { ContentfulClientApi } from 'contentful'
import { useNuxtApp } from '#app'

/**
 * Provides access to the Contentful client instance.
 *
 * This composable returns the initialized Contentful client that was configured
 * during application setup. The client is used to query entries, assets, and other
 * content from your Contentful space.
 *
 * The client is automatically configured with:
 * - Space ID
 * - Access token (or preview access token in editor mode)
 * - Host (CDN or preview host based on editor mode)
 *
 * @returns The Contentful client API instance
 *
 * @example
 * ```ts
 * // Real-world usage from useCMSBySlug composable
 * const contentfulClient = useContentful()
 *
 * // Fetch entries without unresolvable links
 * const data = await contentfulClient.withoutUnresolvableLinks.getEntries<
 *   T,
 *   Locale
 * >({
 *   include: 10,
 *   ...options,
 *   limit: 1,
 * })
 *
 * return data.items.at(0)
 * ```
 */
export function useContentful() {
  const { $contentful } = useNuxtApp()

  return $contentful as ContentfulClientApi<undefined>
}

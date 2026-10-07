import type {
  ChainModifiers,
  EntriesQueries,
  Entry,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { isInEditorMode } from '../utils/helpers'
import { useDefaultCMSOptions } from './useDefaultCMSOptions'
import { useContentful } from './useContentful'
import { useRuntimeConfig } from '#app/nuxt'
import { useRoute } from '#app/composables/router'
import { useAsyncData, type AsyncDataOptions } from '#app/composables/asyncData'
import { useLog } from '#storefront/composables'

type EntriesQueriesWithoutLimit<
  T extends EntrySkeletonType = EntrySkeletonType,
  Modifiers extends ChainModifiers = ChainModifiers,
> = EntriesQueries<T, Modifiers> & { limit?: never }

/**
 * Determines if an error from Contentful is related to an invalid or unknown locale.
 * Contentful returns a 400 BadRequest error with the message "Unknown locale: {locale}"
 * when a locale is not configured in the space.
 * Contentful SDK wraps API errors with the error message as a stringified JSON object.
 * This function detects when the error indicates an unconfigured locale.
 *
 * @param error - The error to check (can be any type)
 *
 * @returns `true` if the error is locale-related, `false` otherwise
 *
 * @example
 * ```typescript
 * // Actual Contentful error structure:
 * {
 *   name: 'BadRequest',
 *   message: '{\n  "status": 400,\n  "message": "Unknown locale: en-DE",\n  ...\n}'
 * }
 * ```
 *
 * @internal Exported for testing purposes only
 */
export function isUnconfiguredLocaleError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const err = error as { message?: string; name?: string }

  // Contentful returns name: 'BadRequest' with message containing "Unknown locale"
  if (err.name === 'BadRequest' && typeof err.message === 'string') {
    return err.message.includes('Unknown locale')
  }

  return false
}

/**
 * Fetches a single CMS entry from Contentful by matching query criteria.
 *
 * This composable implements a hybrid locale fallback strategy:
 *
 * **Primary mechanism (Recommended):** Configure fallback locales in your Contentful space
 * (e.g., `de-CH` → `de-DE` → `en-US`). This provides optimal performance with server-side
 * fallback handling and granular control over fallback chains. No application changes needed -
 * the integration already passes the shop's locale, and Contentful handles the fallback.
 *
 * **Secondary mechanism (Safety net):** If a locale is completely unconfigured in the CMS space
 * (e.g., launching in a new market before CMS setup), this composable automatically retries
 * without specifying a locale, allowing Contentful to return content in its default locale.
 *
 * The composable uses `useAsyncData` under the hood, providing reactive data handling
 * and automatic refetching when dependencies change.
 *
 * @template T - The Contentful entry skeleton type
 * @template Locale - The locale code type
 *
 * @param key - Unique key for the async data cache
 * @param query - Optional query parameters for filtering entries (reactive or static).
 *                Note: `limit` is always set to 1 internally.
 * @param asyncDataOption - Optional configuration for `useAsyncData` behavior
 *
 * @returns The result from `useAsyncData` containing the fetched entry or undefined
 *
 * @example
 * ```ts
 * // Real-world usage from PageComponent.vue
 * const { slug } = defineProps<{ slug: string }>()
 *
 * const { data, status, error } = await useCMSBySlug<TypePageComponentSkeleton>(
 *   `cms-content-${slug}`,
 *   {
 *     content_type: 'PageComponent',
 *     'fields.slug[match]': slug,
 *   }
 * )
 * ```
 *
 * @see https://www.contentful.com/developers/docs/tutorials/general/setting-locales/#handling-the-missing-translations
 */
export function useCMSBySlug<
  T extends EntrySkeletonType = EntrySkeletonType,
  Locale extends LocaleCode = LocaleCode,
>(
  key: string,
  query?: MaybeRefOrGetter<
    EntriesQueriesWithoutLimit<T, 'WITHOUT_UNRESOLVABLE_LINKS'>
  >,
  asyncDataOption?: AsyncDataOptions<
    Entry<T, 'WITHOUT_UNRESOLVABLE_LINKS', Locale> | undefined
  >,
) {
  const route = useRoute()
  const defaultCMSOptions = useDefaultCMSOptions()
  const contentfulClient = useContentful()
  const log = useLog()
  const config = useRuntimeConfig()

  /**
   * Fetches entries from Contentful with the given options.
   *
   * @param options - Query options to pass to Contentful
   *
   * @returns The first matching entry or undefined
   */
  const fetchEntry = async (
    options: Record<string, unknown>,
  ): Promise<Entry<T, 'WITHOUT_UNRESOLVABLE_LINKS', Locale> | undefined> => {
    const data = await contentfulClient.withoutUnresolvableLinks.getEntries<
      T,
      Locale
    >({
      include: 10,
      ...options,
      limit: 1,
    })

    return data.items.at(0)
  }

  const { data, status, error } = useAsyncData(
    key,
    async () => {
      const queryValue = toValue(query)

      try {
        // Attempt to fetch content with the shop's configured locale.
        // If the locale is configured in Contentful but content is missing,
        // Contentful's native fallback mechanism (configured via fallback locales)
        // will automatically return content from the fallback locale.
        return await fetchEntry({
          ...defaultCMSOptions,
          ...queryValue,
        })
      } catch (error) {
        // Safety net: If the locale is completely unconfigured in Contentful
        // (e.g., launching in a new market before CMS configuration is complete),
        // retry without specifying a locale to use Contentful's default locale.
        // This is a last resort - prefer configuring fallback locales in Contentful.
        if (isUnconfiguredLocaleError(error)) {
          log.warn(
            `CMS: Locale '${defaultCMSOptions.locale}' is not configured in Contentful. Retrying with Contentful's default locale. For better performance, configure fallback locales in your Contentful space.`,
          )

          try {
            // Destructure to exclude the locale property
            const { locale, ...optionsWithoutLocale } = defaultCMSOptions

            return await fetchEntry({
              ...optionsWithoutLocale,
              ...queryValue,
            })
          } catch (fallbackError) {
            log.error(
              'CMS: Failed to fetch content with Contentful default locale.',
              fallbackError,
            )
            throw fallbackError
          }
        }

        // Re-throw non-locale errors
        throw error
      }
    },
    {
      // Use the `rpcDefaultLazy` for consistent lazy loading behavior similar to the useRpc composable.
      lazy: config.public.storefront.rpcDefaultLazy,
      ...asyncDataOption,
      watch: [() => toValue(query)],
      // Enable deep reactivity in editor mode to track content updates from the Contentful editor
      deep: isInEditorMode(route),
      // Defer deduplication to avoid conflicts to avoid fetching the same content multiple times
      dedupe: 'defer',
    },
  )

  const fetchSpace = async () => {
    return useAsyncData(
      `${key}-contentful-space`,
      async () => {
        try {
          return await contentfulClient.getSpace()
        } catch (error) {
          log.error('CMS: Failed to fetch Contentful space.', error)
        }
      },
      {
        lazy: config.public.storefront.rpcDefaultLazy,
      },
    )
  }

  return {
    data,
    status,
    error,
    fetchSpace,
  }
}

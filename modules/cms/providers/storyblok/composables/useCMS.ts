import type { ISbStory } from '@storyblok/vue'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { useStoryblokApi } from '@storyblok/vue'
import { isInEditorMode, resolveStoryblokSlug } from '../utils/helpers'
import type { StoryblokRuntimeConfig } from '../types'
import { useDefaultStoryblokOptions } from './useDefaultStoryblokOptions'
import { useRoute } from '#app/composables/router'
import { useAsyncData, type AsyncDataOptions } from '#app/composables/asyncData'
import { useI18n } from '#i18n'
import { useRuntimeConfig } from '#app/nuxt'
import { useLog } from '#storefront/composables'

/**
 * Fetches a single CMS story from Storyblok by slug with internationalization support.
 *
 * Automatically resolves the Storyblok slug based on the current locale and folder structure.
 * Content is organized in locale-prefixed folders (e.g., `/de/about`, `/en/about`) regardless
 * of the Storefront's routing mode (path-based, domain-based, or path-except-default).
 *
 * This composable uses `useAsyncData` under the hood, providing reactive data handling
 * and automatic refetching when dependencies change. If content is not found for the
 * current locale, it returns null and lets the component handle the 404 gracefully.
 *
 * @template T - The Storyblok story content type
 *
 * @param key - Unique key for the async data cache
 * @param slug - The story slug to fetch (reactive or static). Pass route path and it will be resolved to Storyblok folder structure
 * @param asyncDataOption - Optional configuration for `useAsyncData` behavior
 *
 * @returns The result from `useAsyncData` containing the fetched story or `null` if not found
 *
 * @example
 * ```ts
 * // Basic usage from PageComponent.vue
 * const { slug } = defineProps<{ slug: string }>()
 *
 * const { data, status, error } = await useCMSBySlug<PageComponent>(
 *   `cms-content-${slug}`,
 *   slug,
 * )
 * // URL: /de/about → Fetches: de/about from Storyblok
 * // URL: / → Fetches: de/homepage from Storyblok (if de is current locale)
 *
 * // With custom folder mapping (via runtime config)
 * // URL: /about → Fetches: german/about if folderMapping: { de: 'german' }
 * ```
 *
 * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/features/internationalization
 */
export function useCMSBySlug<T>(
  key: string,
  slug: MaybeRefOrGetter<string>,
  asyncDataOption?: AsyncDataOptions<ISbStory<T>>,
) {
  const storyblokApi = useStoryblokApi()
  const storyblokOptions = useDefaultStoryblokOptions()
  const route = useRoute()
  const i18n = useI18n()
  const config = useRuntimeConfig()
  const log = useLog()

  const cms = config.public.cms as StoryblokRuntimeConfig

  return useAsyncData(
    key,
    async () => {
      const rawSlug = toValue(slug)
      // `i18n.locale.value` returns the shop code (e.g., 'de', 'at', 'de-en')
      // not the full locale (e.g., 'de-DE', 'de-AT', 'en-DE')
      // This allows multiple shops with same language but different codes
      const localeCode = i18n.locale.value

      // Resolve the Storyblok slug with shop code folder prefix
      const resolvedSlug = resolveStoryblokSlug(
        localeCode,
        rawSlug,
        cms.folderMapping,
      )

      try {
        // Attempt to fetch content from Storyblok
        const story = await storyblokApi.getStory(resolvedSlug, {
          ...storyblokOptions,
        })

        return story as unknown as ISbStory<T>
      } catch (error: unknown) {
        // Handle 404 errors gracefully - content not found for this locale
        if (error && typeof error === 'object' && 'status' in error) {
          if (error.status === 404) {
            log.warn(
              `CMS: Storyblok content not found for slug "${resolvedSlug}" (locale: ${localeCode})`,
            )
            // Return null to let component handle 404 gracefully
            return null as unknown as ISbStory<T>
          }
        }

        // Re-throw other errors (500, network issues, etc.)
        throw error
      }
    },
    {
      // Use the `rpcDefaultLazy` for consistent lazy loading behavior similar to the useRpc composable.
      lazy: config.public.storefront.rpcDefaultLazy,
      ...asyncDataOption,
      watch: [() => toValue(slug), () => i18n.locale.value],
      // Enable deep reactivity in editor mode to track content updates from the Storyblok editor
      deep: isInEditorMode(route),
      // Defer deduplication to avoid conflicts to avoid fetching the same content multiple times
      dedupe: 'defer',
    },
  )
}

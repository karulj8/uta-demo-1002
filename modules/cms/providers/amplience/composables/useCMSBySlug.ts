import { toValue, type MaybeRefOrGetter } from 'vue'
import { ContentNotFoundError } from 'dc-delivery-sdk-js'
import { useCurrentShop } from '@scayle/storefront-nuxt/composables'
import type { AmplienceRuntimeConfig } from '../types'
import { getVseFromRoute, isInEditorMode } from '../utils/helpers'
import { useAsyncData, type AsyncDataOptions } from '#app/composables/asyncData'
import { useNuxtApp, useRuntimeConfig } from '#app/nuxt'
import { useRoute } from '#app/composables/router'
import { useLog } from '#storefront/composables'

/**
 * Fetches a single Amplience content item by slug with locale-bound resolution.
 *
 * Content items are bound to a locale, so the slug is resolved to a locale-prefixed
 * delivery key (for example `de-DE/content/about`) before fetching. Mirrors the
 * Storyblok folder-per-locale model. Pass a route path and it is namespaced by the
 * current shop locale automatically.
 *
 * Uses `useAsyncData` under the hood and refetches when the slug or locale changes.
 * When no content item matches the delivery key, it resolves to `null` so the
 * component can render a fallback instead of throwing.
 *
 * @template T - Expected Amplience content item shape
 * @param key - Unique key for the async data cache
 * @param slug - Route path to fetch (reactive or static), resolved to a delivery key
 * @param asyncDataOption - Optional configuration for `useAsyncData`
 * @returns Async data result where `data` is the matched item or `null` on miss
 *
 * @example
 * ```ts
 * // From PageComponent.vue
 * const { data, status } = await useCMSBySlug<PageComponent>(
 *   `cms-content-${slug}`,
 *   () => slug,
 * )
 * // URL: /content/about (locale de-DE) → Fetches: de-DE/content/about
 * // URL: / (locale en-GB) → Fetches: en-GB/homepage
 * ```
 */
export function useCMSBySlug<T>(
  key: string,
  slug: MaybeRefOrGetter<string>,
  asyncDataOption?: AsyncDataOptions<T | null>,
) {
  const route = useRoute()
  const config = useRuntimeConfig()
  const { $amplience } = useNuxtApp()
  const currentShop = useCurrentShop()
  const log = useLog()
  const cms = config.public.cms as unknown as AmplienceRuntimeConfig

  const previewKey =
    typeof route.query.key === 'string' ? route.query.key : undefined
  const previewVse = getVseFromRoute(route)
  const localeCode = currentShop.value?.locale ?? cms.locale

  const asyncDataKey = isInEditorMode(route)
    ? `${key}:preview:${previewVse}:${previewKey}`
    : `${key}:${localeCode}`

  return useAsyncData<T | null>(
    asyncDataKey,
    async () => {
      const resolvedLocale = currentShop.value?.locale ?? cms.locale
      const deliveryKey =
        isInEditorMode(route) && cms.allowDrafts && previewKey
          ? previewKey
          : `${resolvedLocale}/${toValue(slug)}`

      try {
        const content = await $amplience.getContentItemByKey(deliveryKey)
        // The delivery SDK wraps fields in classes that Nuxt cannot hydrate.
        // JSON round-tripping invokes SDK toJSON() hooks and yields plain objects.
        return JSON.parse(JSON.stringify(content)) as T
      } catch (error) {
        if (error instanceof ContentNotFoundError) {
          log.warn(
            `CMS: Amplience content not found for delivery key "${deliveryKey}"`,
          )
          return null
        }

        throw error
      }
    },
    {
      lazy: config.public.storefront.rpcDefaultLazy,
      ...asyncDataOption,
      watch: [() => toValue(slug), () => currentShop.value?.locale],
      deep: isInEditorMode(route),
      dedupe: 'defer',
    },
  )
}

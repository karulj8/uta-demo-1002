import { onMounted, toValue, toRaw, onBeforeUnmount } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useCurrentShop, useLog } from '@scayle/storefront-nuxt/composables'
import contentstack, {
  QueryOperation,
  type LivePreviewQuery,
} from '@contentstack/delivery-sdk'
import { HttpStatusCode, HttpStatusMessage } from '@scayle/storefront-nuxt'
import { isInEditorMode } from '../utils/utils'
import type {
  PageComponent,
  ProductlistingpageComponent,
} from '../types/gen/contentstack'
import { useContentstack } from './useContentStack'
import { useAsyncData } from '#app/composables/asyncData'
import { useRuntimeConfig } from '#app/nuxt'
import { useRoute } from '#app/composables/router'
import type { AsyncDataOptions } from '#app'

/**
 * Fetches a single CMS entry from Contentstack based on the given slug and current shop's locale.
 *
 * This composable queries Contentstack for a single entry by matching the provided slug to the `url` field,
 * and the current shop's locale to the entry's configured locale. If there is no content available for the
 * requested locale, Contentstack automatically returns content in a fallback language according to its
 * locale fallback configuration.
 *
 * The composable uses `useAsyncData` for reactive data fetching and supports reactivity when any dependencies
 * change (e.g., route or shop locale), with automatic refetching as needed.
 *
 * @template T - The Contentstack component type
 *
 * @param key - Unique key for the async data cache
 * @param slug - The slug of the current page; matched against the `url` field (reactive or static)
 * @param contentType - The content type to query for (e.g., "page-component")
 * @param asyncDataOption - Optional configuration for `useAsyncData`
 *
 * @returns The result from `useAsyncData` containing the fetched entry, or throws 404 if not found
 *
 * @example
 * ```ts
 * // Usage inside a component
 * const { slug } = defineProps<{ slug: string }>()
 * const { data, status, error } = await useCMSBySlug<PageComponent>(
 *   `cms-content-${slug}`,
 *   slug,
 *   'page-component',
 * )
 * ```
 *
 * @see https://www.contentstack.com/docs/developers/set-up-fallback-languages
 */
export async function useCMSBySlug<
  T extends PageComponent | ProductlistingpageComponent,
>(
  key: string,
  slug: MaybeRefOrGetter<string>,
  contentType: 'seo_content' extends keyof T
    ? 'productlistingpage-component'
    : 'page-component',
  asyncDataOption?: AsyncDataOptions<T>,
) {
  const route = useRoute()
  const stack = useContentstack()
  const config = useRuntimeConfig()
  const currentShop = useCurrentShop()
  const isInEditor = isInEditorMode(route)
  const log = useLog()

  const fetchEntry = async () => {
    if (isInEditor && route.query.live_preview) {
      stack.livePreviewQuery(toRaw(route.query) as unknown as LivePreviewQuery)
    }
    const entries = await stack
      .contentType(contentType)
      .entry()
      .locale(currentShop.value.locale.toLowerCase())
      // This will the content with the fallback locale if the content is not available in the current locale
      // See: https://www.contentstack.com/docs/developers/sdks/content-delivery-sdk/javascript-browser/reference#includefallback
      .includeFallback()
      .query()
      .addParams({
        // include data of referenced content
        include_all: true,
        // include data of referenced content up to the maximum depth of 5 levels
        include_all_depth: 5,
        // include image dimensions
        include_dimension: true,
      })
      .where('url', QueryOperation.EQUALS, `/${toValue(slug)}`)
      .limit(1)
      .find<T>()
    if (!entries?.entries?.at(0)) {
      throw new Error(HttpStatusMessage.NOT_FOUND, {
        cause: {
          statusCode: HttpStatusCode.NOT_FOUND,
          statusMessage: HttpStatusMessage.NOT_FOUND,
        },
      })
    }
    const entry = entries?.entries?.at(0) as T
    if (isInEditor) {
      contentstack.Utils.addEditableTags(
        entry as unknown as contentstack.Utils.EntryModel,
        contentType,
        true,
        currentShop.value.locale.toLowerCase(),
      )
    }
    return entry
  }

  const { data, status, error, refresh } = useAsyncData(
    key,
    async () => {
      return fetchEntry()
    },
    {
      // Use the `rpcDefaultLazy` for consistent lazy loading behavior similar to the useRpc composable.
      lazy: config.public.storefront.rpcDefaultLazy,
      ...asyncDataOption,
      watch: [() => toValue(slug)],
      // Enable deep reactivity in editor mode to track content updates from the Contentstack editor
      deep: isInEditorMode(route),
      // Defer deduplication to avoid conflicts to avoid fetching the same content multiple times
      dedupe: 'defer',
    },
  )

  const initContentStackLivePreview = async () => {
    try {
      const { default: ContentstackLivePreview } = await import(
        '@contentstack/live-preview-utils'
      )
      const callbackID = ContentstackLivePreview?.onEntryChange(refresh)
      onBeforeUnmount(() =>
        ContentstackLivePreview?.unsubscribeOnEntryChange(callbackID),
      )
    } catch (error) {
      log.error('CMS: Failed to initialize Contentstack Live Preview', error)
    }
  }

  onMounted(() => {
    if (isInEditorMode(route)) {
      initContentStackLivePreview()
    }
  })

  return {
    data,
    status,
    error,
  }
}

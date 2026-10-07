import type { ISbStoriesParams } from '@storyblok/vue'
import type { StoryblokRuntimeConfig } from '../types'
import { isInEditorMode } from '../utils/helpers'
import { useRuntimeConfig } from '#app/nuxt'
import { useRoute } from '#app/composables/router'
import { useCurrentShop } from '#storefront/composables'

/**
 * Provides default query options for Storyblok CMS requests.
 *
 * This composable returns an object containing configuration for Storyblok API queries:
 * - Current shop's language/locale
 * - Content version (draft in editor mode, published otherwise)
 * - Link resolution strategy
 *
 * @returns An object with the following properties:
 * - `language`: The current shop's language code (e.g., `en`, `de`)
 * - `version`: Content version (`draft` in editor mode with allowDrafts, `published` otherwise)
 * - `resolve_links`: Link resolution strategy (set to `url`)
 *
 * @example
 * ```ts
 * // Real-world usage from useCMSBySlug composable
 * const storyblokOptions = useDefaultStoryblokOptions()
 *
 * // Fetch story with the shop's configured locale
 * storyblokApi.getStory(toValue(slug), {
 *   ...storyblokOptions,
 * })
 * ```
 */
export function useDefaultStoryblokOptions(): Pick<
  ISbStoriesParams,
  'language' | 'version' | 'resolve_links'
> {
  const route = useRoute()
  const currentShop = useCurrentShop()
  const config = useRuntimeConfig()
  const { allowDrafts } = config.public.cms as StoryblokRuntimeConfig

  return {
    version: isInEditorMode(route) && allowDrafts ? 'draft' : 'published',
    language: currentShop.value.locale ?? '',
    resolve_links: 'url',
  }
}

import { toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { RouteLocationNormalizedLoadedGeneric } from '#vue-router'

/**
 * Checks if Contentful Live Preview is active.
 *
 * Detects the `_editorMode` query parameter added by the Live Preview editor.
 * Used to enable draft content and live reactivity during editing.
 *
 * @param route - Current route object
 * @returns `true` if Live Preview is active
 *
 * @example
 * ```typescript
 * // Enable draft content in editor
 * const isInEditor = isInEditorMode(route)
 *
 * // Enable deep reactivity for live updates
 * const deep = isInEditorMode(route)
 * ```
 *
 * @see https://www.contentful.com/developers/docs/tutorials/general/live-preview/
 */
export const isInEditorMode = (route: RouteLocationNormalizedLoadedGeneric) => {
  return '_editorMode' in route.query
}

/**
 * Generates hreflang links for a Contentful page.
 *
 * @param contentfulLinks - A list of Contentful page alternates for all shops.
 * @param defaultLocale - The default locale of the store.
 *
 * @returns An array of hreflang links.
 */
export const generateContentfulHreflangLinks = (
  contentfulLinks: MaybeRefOrGetter<
    { locale: string; href: string; path: string }[] | undefined
  >,
  defaultLocale: string,
): { rel: string; hreflang: string; href: string }[] => {
  const links = toValue(contentfulLinks)
  if (!links?.length) {
    return []
  }

  return links.flatMap(({ locale, href, path }) => {
    const link = { rel: 'alternate', hreflang: locale, href }

    return path === defaultLocale
      ? [link, { rel: 'alternate', hreflang: 'x-default', href }]
      : [link]
  })
}

import { toValue, type MaybeRefOrGetter } from 'vue'
import type { ISbStoryData } from '@storyblok/vue'
import type { StoryblokMultilink } from '../types/gen/storyblok'
import { isExternalLink } from '../../../utils/helpers'
import type { PageComponent } from '../types'
import type { RouteLocationNormalizedLoadedGeneric } from '#vue-router'

/**
 * Resolves a route path to a Storyblok folder slug with locale prefix.
 *
 * Automatically prepends the shop code (i18n locale) to create the Storyblok slug
 * for folder-based internationalization. Handles all Storefront routing modes:
 * path-based, domain-based, and path-except-default.
 *
 * Works seamlessly with Nuxt's `app.baseURL` configuration - the baseURL is handled
 * by Nuxt's router and is never included in route paths or params, so no special
 * handling is required.
 *
 * @param localeCode - i18n locale code (e.g., `de`, `en`, `ch`)
 * @param path - Route path to resolve (e.g., `/about`, `/products/shoes`)
 * @param folderMapping - Optional custom mapping of locale codes to Storyblok folder names
 *
 * @returns Storyblok slug with locale prefix (e.g., `de/about`, `en/homepage`)
 *
 * @example
 * ```typescript
 * // Basic usage for about page
 * resolveStoryblokSlug('de', '/about')
 * // Returns: 'de/about'
 *
 * // Homepage handling
 * resolveStoryblokSlug('en', '/')
 * // Returns: 'en/homepage'
 *
 * // Path-based routing - removes shop prefix from path
 * resolveStoryblokSlug('de', '/de/about')
 * // Returns: 'de/about'
 *
 * // Custom folder mapping
 * resolveStoryblokSlug('de', '/about', { de: 'german' })
 * // Returns: 'german/about'
 *
 * // Works with app.baseURL (e.g., '/prefix/')
 * // Route path is always '/about', never '/prefix/about'
 * resolveStoryblokSlug('de', '/about')
 * // Returns: 'de/about'
 * ```
 */
export const resolveStoryblokSlug = (
  localeCode: string,
  path: string,
  folderMapping?: Record<string, string>,
): string => {
  // Apply custom folder mapping if provided
  const folderName = folderMapping?.[localeCode] ?? localeCode

  // Normalize path: trim and remove leading/trailing slashes
  // eslint-disable-next-line sonarjs/super-linear-regex
  let cleanPath = path.trim().replace(/^\/+|\/+$/g, '')

  // Early return for empty path (root), always map to /homepage in Storyblok
  if (!cleanPath) {
    return `${folderName}/homepage`
  }

  // Remove locale prefix if present (e.g., 'de/about' becomes 'about')
  // Escape special regex characters in localeCode for safety.
  // This prevents issues if a locale code contains special regex characters.
  const escapedLocale = localeCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  cleanPath = cleanPath.replace(new RegExp(`^${escapedLocale}(?:/|$)`), '')

  // Return homepage if path is empty after prefix removal, otherwise return the path
  return cleanPath ? `${folderName}/${cleanPath}` : `${folderName}/homepage`
}

/**
 * Extracts URL from Storyblok's multilink field.
 *
 * Handles both internal story links and external URLs.
 * Used in LinkComponent and ButtonComponent to resolve link targets.
 *
 * @param url - Storyblok multilink field from CMS
 * @returns Resolved URL string (story slug or external URL)
 *
 * @example
 * ```typescript
 * // Internal story link
 * generateLink({ linktype: 'story', story: { full_slug: 'about' } })
 * // Returns: 'about'
 *
 * // External link
 * generateLink({ linktype: 'url', url: 'https://example.com' })
 * // Returns: 'https://example.com'
 * ```
 */
export const generateLink = (url: StoryblokMultilink) => {
  if (url.linktype === 'story' && url.story?.full_slug) {
    return url.story.full_slug
  }

  if (isExternalLink(url.url || url.cached_url)) {
    return url.url || url.cached_url
  }

  return url.url || url.cached_url
}

/**
 * Checks if Storyblok Visual Editor is active.
 *
 * Detects the `_storyblok` query parameter added by the Visual Editor.
 * Used to enable draft content and live reactivity during editing.
 *
 * @param route - Current route object
 * @returns `true` if Visual Editor is active
 *
 * @example
 * ```typescript
 * // Enable draft content in editor
 * const version = isInEditorMode(route) ? 'draft' : 'published'
 *
 * // Enable deep reactivity for live updates
 * const deep = isInEditorMode(route)
 * ```
 *
 * @see https://www.storyblok.com/docs/concepts/visual-editor
 */
export const isInEditorMode = (route: RouteLocationNormalizedLoadedGeneric) => {
  return '_storyblok' in route.query
}

/**
 * Generates hreflang links for a Storyblok page.
 *
 * @param storyblokLinks - A list of Storyblok page links for all shops.
 * @param defaultLocale - The default locale of the store.
 *
 * @returns An array of hreflang links.
 */
export const generateStoryblokHreflangLinks = (
  storyblokLinks: MaybeRefOrGetter<
    { locale: string; href: string; path: string }[]
  >,
  defaultLocale: string,
): { rel: string; hreflang: string; href: string }[] => {
  const links = toValue(storyblokLinks)

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

/**
 * Get the keys for the path from the folderMapping configuration.
 *
 * @param path - The path to get the keys for
 * @param folderMapping - The folderMapping configuration
 * @returns The keys for the path
 */
const getFolderMappingKeysForPath = (
  path?: string,
  folderMapping?: Record<string, string>,
) => {
  if (!folderMapping || !path) {
    return []
  }
  return Object.keys(folderMapping).filter(
    (key) => folderMapping[key] === path && key !== path,
  )
}

/**
 * Get all source slugs from the story and extend it with the paths from `folderMapping` configuration.
 * We use the content paths from the story to get the keys for the `folderMapping` configuration.
 * These values will then be used to generate the additional hreflang links.
 *
 * @param story - The story to get the source slugs from
 * @returns An array of objects with the path and slug
 */
export const getAllSourceSlugs = (
  story?: ISbStoryData<PageComponent>,
  folderMapping?: Record<string, string>,
): { path: string; slug: string }[] => {
  if (!story) {
    return []
  }

  const sourceSlugsFromCMS = [
    story.full_slug,
    ...(story.alternates?.map((a) => a.full_slug) ?? []),
  ]

  return sourceSlugsFromCMS.reduce<{ path: string; slug: string }[]>(
    (acc, sourceSlug) => {
      const [path, ...rest] = sourceSlug.split('/')
      if (!path) {
        return acc
      }

      const slug = rest.join('/')
      const keys = getFolderMappingKeysForPath(path, folderMapping)

      return [
        ...acc,
        ...keys.map((key) => ({ path: key, slug })),
        { path, slug },
      ]
    },
    [],
  )
}

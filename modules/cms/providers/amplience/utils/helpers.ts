import type { AmplienceRuntimeConfig } from '../types'
import type { RouteLocationNormalizedLoadedGeneric } from '#vue-router'

/**
 * Checks if Amplience visualization preview is active.
 *
 * Detects preview mode when a VSE query parameter is present.
 *
 * @param route - Current route object
 * @returns `true` when the storefront is rendered inside the Amplience editor
 */
export const isInEditorMode = (route: RouteLocationNormalizedLoadedGeneric) => {
  return 'vse' in route.query || '_vse' in route.query
}

/**
 * Resolves the Virtual Staging Environment domain from route query parameters.
 *
 * @param route - Current route object
 * @returns VSE domain when present in the query string
 */
export const getVseFromRoute = (
  route: RouteLocationNormalizedLoadedGeneric,
): string | undefined => {
  const vse = route.query.vse ?? route.query._vse
  if (typeof vse === 'string' && vse.length > 0) {
    return vse
  }
  if (Array.isArray(vse) && typeof vse[0] === 'string') {
    return vse[0]
  }
  return undefined
}

/** Slug prefix used in PLP visualization placeholder paths (`cms-preview-{categoryId}`). */
const PLP_PREVIEW_SLUG_PREFIX = 'cms-preview'

/** Matches the category ID suffix in a PLP delivery key or slug (`c/c-{id}`). */
const PLP_DELIVERY_KEY_CATEGORY_ID = /(?:^|\/)c\/c-(\d+)\/?$/

/**
 * Parses a category ID from an Amplience PLP delivery key or slug.
 *
 * Used by PLP visualization middleware: Amplience only exposes the full delivery key
 * (for example `en-US/c/c-91825`) in `{{delivery.key}}`, not the category ID alone.
 *
 * @param deliveryKeyOrSlug - Full delivery key or relative slug (for example `c/c-100`)
 * @returns Parsed category ID, or undefined when the value does not match the PLP pattern
 *
 * @example
 * ```ts
 * parseCategoryIdFromAmplienceDeliveryKey('en-US/c/c-91825')
 * // Returns: 91825
 * ```
 */
export const parseCategoryIdFromAmplienceDeliveryKey = (
  deliveryKeyOrSlug: string,
): number | undefined => {
  const match = deliveryKeyOrSlug.trim().match(PLP_DELIVERY_KEY_CATEGORY_ID)
  if (!match?.[1]) {
    return undefined
  }

  const categoryId = Number.parseInt(match[1], 10)
  return Number.isNaN(categoryId) ? undefined : categoryId
}

/**
 * Checks whether a path targets the storefront category page route pattern.
 *
 * @param path - Route path (for example `/c/cms-preview-0` or `/de/c/women-123`)
 * @returns `true` when the path ends with a `{slug}-{id}` segment under `/c/`
 */
export const isAmplienceCategoryRoutePath = (path: string): boolean => {
  return /\/c\/[^/]+-\d+$/.test(path)
}

/**
 * Builds a PLP visualization path with the parsed category ID in the route param.
 *
 * Preserves any locale shop prefix before `/c/` (for example `/de/c/cms-preview-91825`).
 *
 * @param path - Current route path containing a `/c/` segment
 * @param categoryId - Category ID extracted from the PLP delivery key
 * @returns Path whose trailing segment is `cms-preview-{categoryId}`
 */
export const resolveAmpliencePlpPreviewPath = (
  path: string,
  categoryId: number,
): string => {
  const previewSegment = `${PLP_PREVIEW_SLUG_PREFIX}-${categoryId}`
  const match = path.match(/^(.*\/c\/)[^/]*$/)

  if (match?.[1]) {
    return `${match[1]}${previewSegment}`
  }

  return `/c/${previewSegment}`
}

/**
 * Builds the Amplience Content Delivery client configuration for the current request.
 *
 * When a VSE query parameter is present and drafts are allowed, the client targets
 * the staging environment so preview serves unpublished content.
 *
 * @param cms - Amplience runtime configuration from Nuxt
 * @param route - Current route, used to read the VSE domain from query parameters
 * @returns Config object passed to `ContentClient`
 */
export const buildAmplienceClientConfig = (
  cms: AmplienceRuntimeConfig,
  route: RouteLocationNormalizedLoadedGeneric,
): {
  hubName: string
  stagingEnvironment?: string
} => {
  const clientConfig: {
    hubName: string
    stagingEnvironment?: string
  } = {
    hubName: cms.hubName,
  }

  const stagingEnvironment = getVseFromRoute(route)
  if (stagingEnvironment && cms.allowDrafts) {
    clientConfig.stagingEnvironment = stagingEnvironment.replace(
      /^https?:\/\//,
      '',
    )
  }

  return clientConfig
}

/**
 * Generates hreflang links for an Amplience page across shop locales.
 *
 * @param links - Alternate locale links for all shops
 * @param defaultLocale - Default locale of the store
 * @returns Array of hreflang link objects for `useHead`
 */
export const generateAmplienceHreflangLinks = (
  links: { locale: string; href: string; path: string }[] | undefined,
  defaultLocale: string,
): { rel: string; hreflang: string; href: string }[] => {
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

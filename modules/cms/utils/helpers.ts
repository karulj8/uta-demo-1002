import { createConsola } from 'consola'
import { CMSProvider } from './config'

/** Module identifier for the local CMS integration. */
export const moduleName = '@scayle/storefront-cms'

/**
 * Logger instance for local CMS module operations.
 *
 * Enabled only when `NUXT_DEBUGGING_ENABLED` is set.
 */
export const logger = createConsola({
  formatOptions: {
    colors: true,
  },
  level: process.env.NUXT_DEBUGGING_ENABLED ? 3 : -1,
  defaults: {
    tag: moduleName,
  },
})

/**
 * Validates if a string is a valid HTTP or HTTPS URL.
 *
 * @param string - The string to validate
 * @returns `true` if the string is a valid HTTP/HTTPS URL
 */
export function isStringURL(string: string) {
  let url

  try {
    url = new URL(string)
  } catch {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

/** List formatter for displaying multiple CMS provider names. */
export const formatter = new Intl.ListFormat('en', {
  style: 'long',
  type: 'conjunction',
})

/**
 * Human-readable list of all supported CMS provider names.
 *
 * Used in error messages when provider configuration is missing.
 *
 * @example "storyblok, contentful, and scayle"
 */
export const formattedProvidersKeys = formatter.format(
  Object.values(CMSProvider),
)

/**
 * Ensures a path starts with a forward slash.
 *
 * @param path - The path to normalize
 * @returns Path with leading slash
 */
export const normalizePathRoute = (path: string) => {
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * Checks if a link is external (starts with 'http').
 *
 * Used to determine link rendering behavior in CMS components.
 *
 * @param link - The link to check
 * @returns `true` if the link is external
 *
 * @example
 * ```typescript
 * isExternalLink('https://example.com') // true
 * isExternalLink('/about') // false
 * ```
 */
export const isExternalLink = (link: string): boolean => {
  return typeof link === 'string' && link.startsWith('http')
}

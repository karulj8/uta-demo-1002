import { HttpStatusCode } from '@scayle/storefront-nuxt'
import { defineNuxtRouteMiddleware, navigateTo } from '#app/composables/router'

/**
 * Removes trailing slashes from URL paths.
 * Preserves root path `/` as-is.
 *
 * @param path - URL path to normalize
 *
 * @returns Path without trailing slashes (or `/` for root)
 *
 * @example
 * ```ts
 * normalizeURLPath('/products/shoes/') // '/products/shoes'
 * normalizeURLPath('/products//')     // '/products'
 * normalizeURLPath('/')               // '/'
 * ```
 */
export const normalizeURLPath = (path: string): string => {
  while (path.endsWith('/') && path.length > 1) {
    path = path.slice(0, -1)
  }
  return path || '/'
}

/**
 * Global middleware to enforce trailing slash removal.
 * Issues 301 permanent redirect for SEO benefits.
 *
 * **Behavior:**
 * - Strips trailing slashes from all paths except root (`/`)
 * - Preserves query parameters and hash fragments
 * - Uses HTTP 301 (Moved Permanently) for SEO
 *
 * @example
 * ```ts
 * // Automatically applied as global middleware
 * // User visits: /products/shoes/
 * // → Redirected to: /products/shoes (301)
 *
 * // Preserves query params and hash
 * // /search/?q=shoes#results → /search?q=shoes#results
 * ```
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== '/' && to.path.endsWith('/')) {
    const nextPath = normalizeURLPath(to.path)

    return navigateTo(
      { path: nextPath, query: to.query, hash: to.hash },
      {
        redirectCode: HttpStatusCode.MOVED_PERMANENTLY,
      },
    )
  }
})

import type { RouteParams } from '#vue-router'

/**
 * Extracts numeric category ID from route parameters.
 * Handles both single string and array formats from dynamic routes.
 *
 * @param route - Route parameters object containing ID
 *
 * @returns Parsed category ID as number
 *
 * @example
 * ```ts
 * // Category page: /c/women-clothing-123
 * const categoryId = getCategoryId(route.params) // 123
 * ```
 */
export const getCategoryId = (route: RouteParams): number => {
  const id = Array.isArray(route.id) ? route.id[0] : route.id

  return parseInt(id as string, 10)
}

/**
 * Extracts numeric product ID from route parameters.
 * Handles both single string and array formats from dynamic routes.
 *
 * @param route - Route parameters object containing ID
 *
 * @returns Parsed product ID as number
 *
 * @example
 * ```ts
 * // Product page: /p/nike-air-max-456
 * const productId = getProductId(route.params) // 456
 * ```
 */
// eslint-disable-next-line sonarjs/no-identical-functions
export const getProductId = (route: RouteParams): number => {
  const id = Array.isArray(route.id) ? route.id[0] : route.id

  return parseInt(id as string, 10)
}

/**
 * Ensures path starts with a leading slash.
 * Used for consistent path formatting before locale prefix checks.
 *
 * @param path - Path string to normalize
 *
 * @returns Path with leading slash
 *
 * @example
 * ```ts
 * normalizePathRoute('women/clothing') // '/women/clothing'
 * normalizePathRoute('/women/clothing') // '/women/clothing'
 * ```
 */
export const normalizePathRoute = (path: string) => {
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * Checks if path starts with the specified locale prefix.
 * Used to determine if path already includes locale code.
 *
 * @param path - Path to check
 * @param prefix - Locale prefix to match (e.g., 'de', 'en')
 *
 * @returns `true` if path starts with prefix, `false` otherwise
 *
 * @example
 * ```ts
 * hasLocalePrefix('/de/women', 'de') // true
 * hasLocalePrefix('/women', 'de') // false
 * hasLocalePrefix('/en/women', 'de') // false
 * ```
 */
export const hasLocalePrefix = (path: string, prefix?: string) => {
  const components = normalizePathRoute(path).split('/')

  return components[1] && components[1] === prefix
}

/**
 * Checks if link is an external URL.
 * Used to determine if link should open in new tab or use router navigation.
 *
 * @param link - URL or path to check
 *
 * @returns `true` if link starts with 'http', `false` otherwise
 *
 * @example
 * ```ts
 * isExternalLink('https://example.com') // true
 * isExternalLink('http://example.com') // true
 * isExternalLink('/products') // false
 * isExternalLink('products') // false
 * ```
 */
export const isExternalLink = (link: string): boolean => {
  return typeof link === 'string' && link.startsWith('http')
}

/** Available route names in the Storefront Application. */
type Link =
  | 'home'
  | 'checkout'
  | 'wishlist'
  | 'basket'
  | 'signin'
  | 'signinCallback'
  | 'signup'
  | 'profile'
  | 'orders'
  | 'account'
  | 'pdp'
  | 'category'
  | 'orderDetail'
  | 'search'
  | 'osp'
  | 'location'
  | 'subscriptionOverview'
  | 'subscriptionCancellations'

/**
 * Route configuration with name, path, and authentication requirements.
 */
export type LinkList = Record<
  Link,
  {
    /** Nuxt route name */
    name: string
    /** Route path */
    path: string
    /** Whether route requires authentication */
    isProtected?: boolean
    /** Optional route parameter */
    parameter?: string
    /** Optional query parameters */
    query?: { [key: string]: string }
  }
>

/**
 * Central route definitions for the storefront application.
 * Used throughout the app for type-safe navigation and route checking.
 *
 * @note
 * Protected routes (with `isProtected: true`) require user authentication
 * and are enforced by the `authGuard` middleware.
 *
 * @example
 * ```ts
 * // Generate localized route path
 * localePath({ name: routeList.search.name, query: { term: 'shoes' } })
 *
 * // Check if current page is basket
 * const isBasketPage = route.path === localePath(routeList.basket)
 *
 * // Access signup query params
 * routeList.signup.query // { register: 'true' }
 * ```
 */
export const routeList: LinkList = {
  home: { name: 'index', path: '/' },
  search: { name: 'search', path: '/search' },
  wishlist: { name: 'wishlist', path: '/wishlist' },
  category: { name: 'c-category-slug-id', path: '/c' },
  pdp: { name: 'p-productName-id', path: '/p' },
  osp: { name: 'success', path: '/success' },
  location: { name: 'location', path: '/location' },
  basket: { name: 'basket', path: '/basket' },
  signin: { name: 'signin', path: '/signin' },
  signinCallback: { name: 'signin-callback', path: '/signin/callback' },
  signup: { name: 'signin', path: '/signin', query: { register: 'true' } },
  checkout: { name: 'checkout', path: '/checkout' },
  profile: {
    name: 'account-profile',
    path: '/account/profile',
    isProtected: true,
  },
  account: { name: 'account', path: '/account', isProtected: true },
  orders: {
    name: 'account-orders',
    path: '/account/orders',
    isProtected: true,
  },
  orderDetail: {
    name: 'account-orders-id',
    path: '/account/orders',
    isProtected: true,
  },
  subscriptionOverview: {
    name: 'subscription-overview',
    path: '/account/subscriptions',
    isProtected: true,
  },
  subscriptionCancellations: {
    name: 'subscription-cancellations',
    path: '/account/subscription-cancellations',
    isProtected: true,
  },
} as const

/**
 * Returns all protected routes that require authentication.
 * Used by auth middleware to determine which routes need login.
 *
 * @param exclude - Optional route key to exclude from results
 *
 * @returns Array of protected route configurations
 *
 * @example
 * ```ts
 * // Get all protected routes
 * const protectedRoutes = getProtectedRouteList()
 * // [{ name: 'account', path: '/account', isProtected: true }, ...]
 *
 * // Get protected routes excluding account
 * const routesWithoutAccount = getProtectedRouteList('account')
 *
 * // Used in auth guard middleware
 * const isProtected = routes.some(
 *   route => route.name === targetRouteName
 * )
 * ```
 */
export const getProtectedRouteList = (
  exclude?: string,
): LinkList[keyof LinkList][] => {
  return Object.entries(routeList)
    .filter(([key, value]) => value.isProtected && exclude !== key)
    .map(([, route]) => route)
}

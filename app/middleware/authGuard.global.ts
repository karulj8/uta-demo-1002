import { useNuxtApp } from '#app'
import { defineNuxtRouteMiddleware, navigateTo } from '#app/composables/router'
import { useLocalePath, useRouteBaseName } from '#i18n'
import { useCurrentShop, useUser } from '#storefront/composables'
import { getProtectedRouteList, routeList, type LinkList } from '~/utils/route'

/**
 * Global authentication guard middleware.
 * Protects routes requiring authentication and manages signin redirects.
 *
 * **Behavior:**
 * - Redirects unauthenticated users from protected routes to signin with `redirectUrl`
 * - Prevents authenticated users from accessing signin page
 * - Attaches `redirectUrl` query param when navigating to signin
 * - Redirects guest users away from protected routes
 *
 * **Protected Routes:**
 * Account, profile, orders, order details, and subscription pages.
 *
 * @example
 * ```ts
 * // Automatically applied as global middleware
 * // User tries to access /account without authentication
 * // → Redirected to /signin?redirectUrl=/account
 *
 * // User logs in successfully
 * // → Redirected back to /account (from redirectUrl)
 * ```
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const currentShop = useCurrentShop()

  // Skip middleware for API routes and when shop is not loaded
  if (to.path.includes('/api') || !currentShop.value) {
    return
  }

  const nuxt = useNuxtApp()
  const getLocalePath = useLocalePath()
  const userComposable = await useUser({
    key: 'authGuard-user',
    immediate: false,
  })

  /** Gets localized path for route. */
  const localePath = (routePath: LinkList[keyof LinkList]['path']) => {
    return getLocalePath(routePath) || routePath
  }

  const getRouteBaseName = useRouteBaseName()

  /** Checks if target route requires authentication. */
  const isProtectedRoute = (exclude?: string): boolean => {
    const routes = getProtectedRouteList(exclude)
    const targetBaseName = getRouteBaseName(to)

    return routes.some(
      (protectedRoute) => protectedRoute.name === targetBaseName,
    )
  }

  // Refresh user data on client-side if accessing protected route
  if (!nuxt.ssrContext && !userComposable.user.value && isProtectedRoute()) {
    await userComposable.refresh()
  }

  // Get user from SSR context or client-side composable
  const user = nuxt?.ssrContext
    ? nuxt?.ssrContext?.event?.context?.$rpcContext?.user
    : userComposable.user.value

  // Redirect unauthenticated users from protected routes to signin
  // Attach `redirectUrl` to return them after login
  if (!user && isProtectedRoute()) {
    return navigateTo({
      path: localePath(routeList.signin.path),
      query: {
        redirectUrl: to.fullPath,
      },
    })
  }

  const localizedSignInPath = localePath(routeList.signin.path)

  // Attach previous route as `redirectUrl` when navigating to signin page
  // This preserves the original destination for post-login redirect
  if (
    !user &&
    to.path === localizedSignInPath &&
    to.fullPath !== from.fullPath &&
    !to.query.redirectUrl
  ) {
    // Skip if navigating within signin page itself
    if (from.name === to.name) {
      return
    }

    return navigateTo({
      path: to.fullPath,
      query: {
        ...to.query,
        redirectUrl: from.fullPath,
      },
    })
  }

  // Prevent authenticated users from accessing signin page
  // Redirect to home instead (to.path covers all signin variants)
  if (user && to.path === localizedSignInPath) {
    return navigateTo({ path: localePath(routeList.home.path) })
  }

  const isGuest = !!user?.status?.isGuestCustomer

  // Redirect guest users away from protected routes
  // Guest checkout users cannot access account pages
  if (user && isGuest && isProtectedRoute()) {
    const redirectPath =
      (to.query.redirectUrl as string) || localePath(routeList.home.path)
    return navigateTo({ path: redirectPath })
  }
})

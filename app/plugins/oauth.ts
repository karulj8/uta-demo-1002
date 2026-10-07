import { defineNuxtPlugin } from 'nuxt/app'
import { useClientId } from '../composables/useClientId'

/**
 * Nuxt plugin to hydrate OAuth client ID during SSR.
 * Transfers OAuth client ID from server RPC context to client-side state.
 *
 * **Behavior:**
 * - Server-side only execution
 * - Extracts client ID from RPC context during SSR
 * - Provides client ID to `useClientId` composable for client hydration
 * - Skips execution if shop context is unavailable
 *
 * **Use Case:**
 * Required for OAuth authentication flows where client ID must be available
 * on both server and client for consistent authentication state.
 *
 * @see https://nuxt.com/docs/guide/directory-structure/plugins#providing-helpers
 *
 * @example
 * ```ts
 * // Automatically executed during SSR
 * // Server extracts clientId from RPC context
 * // Client receives hydrated clientId via useClientId()
 *
 * // Usage in components:
 * const clientId = useClientId()
 * console.log(clientId.value) // OAuth client ID from SSR
 * ```
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Skip on client-side and when shop context is unavailable
  if (!import.meta.server || !nuxtApp.ssrContext?.event.context.$currentShop) {
    return
  }

  const clientId = useClientId()
  const oauth = nuxtApp.ssrContext.event.context.$rpcContext?.oauth

  // Parse and store OAuth client ID for client-side hydration
  clientId.value = oauth?.clientId ? parseInt(oauth.clientId, 10) : undefined
})

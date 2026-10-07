import { scayleKvDriver } from '@scayle/unstorage-scayle-kv-driver'
import compressionDriver from '@scayle/unstorage-compression-driver'
import vercelKV from 'unstorage/drivers/vercel-kv'
import { stringToBoolean } from '../utils/boolean'

// NOTE: We need to import here from the Nuxt server-specific #imports to mitigate
// unresolved dependencies in the imported composables from Nitro (nitropack).
// This results in `nuxt typecheck` not being able to properly infer the correct
// import and throw an error without explicit `@ts-expect-error`
// @ts-expect-error TS2724: '"#imports"' has no exported member named 'defineNitroPlugin'. Did you mean 'defineNuxtPlugin'?
import { defineNitroPlugin, useStorage } from '#imports'

/**
 * Configures storage drivers for the Storefront Application.
 *
 * This plugin sets up two storage namespaces:
 * - `storefront-session`: Stores user session data (authentication, basket state, etc.)
 * - `storefront-cache`: Stores cached API responses and other cacheable data
 *
 * The storage configuration adapts based on the deployment environment:
 * - **Vercel**: Uses Vercel KV (Redis) for both session and cache storage with gzip compression
 * - **Other platforms**: Uses SCAYLE KV driver with brotli compression for better compression ratios
 *
 * @note
 * Environment variables can be used to configure the SCAYLE KV driver:
 * - `NUXT_STOREFRONT_STORAGE_SESSION_DISABLE_CLUSTER_MODE`: Disable Redis cluster mode for sessions
 * - `NUXT_STOREFRONT_STORAGE_CACHE_DISABLE_CLUSTER_MODE`: Disable Redis cluster mode for cache
 *
 * @see https://scayle.dev/en/core-documentation/storefront-guide/storefront-application/technical-foundation/storage
 */
export default defineNitroPlugin(() => {
  const storage = useStorage()

  // Vercel-specific configuration
  // This is only needed when one of the target environments is Vercel.
  // If none of the target environments is Vercel, this can be removed.
  if (import.meta.preset?.includes('vercel')) {
    // Mount Vercel KV for session storage (user authentication, basket state)
    storage.mount('storefront-session', vercelKV({}))

    // Mount Vercel KV for cache storage with gzip compression
    // Gzip is used on Vercel for better compatibility and reasonable compression
    storage.mount(
      'storefront-cache',
      compressionDriver({
        encoding: 'gzip',
        passthroughDriver: vercelKV({}),
      }),
    )
    return
  }

  // Default configuration for non-Vercel environments (uses SCAYLE KV)

  // Mount SCAYLE KV driver for session storage
  // Cluster mode can be disabled via environment variable if needed
  storage.mount(
    'storefront-session',
    scayleKvDriver({
      disableClusterMode: stringToBoolean(
        process.env.NUXT_STOREFRONT_STORAGE_SESSION_DISABLE_CLUSTER_MODE,
      ),
    }),
  )

  // Mount SCAYLE KV driver for cache storage with brotli compression
  // Brotli provides better compression ratios than gzip for cached data
  storage.mount(
    'storefront-cache',
    compressionDriver({
      encoding: 'brotli', // Better compression ratio than gzip but uses more CPU
      passthroughDriver: scayleKvDriver({
        disableClusterMode: stringToBoolean(
          process.env.NUXT_STOREFRONT_STORAGE_CACHE_DISABLE_CLUSTER_MODE,
        ),
        ttl: 10 * 60, // Time-to-live: 10 minutes (600 seconds)
      }),
    }),
  )
})

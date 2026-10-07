import { vi } from 'vitest'
import { defineNuxtRouteMiddleware } from '#app/composables/router'

/*
 * Nuxt's generated `#build/fetch` template eagerly calls `useRuntimeConfig()`
 * at import time, which throws outside a real Nuxt app instance. Plain
 * `happy-dom` tests never create one, so any import chain that reaches
 * `#build/fetch` (e.g. via `#storefront/composables` or `#i18n`) crashes
 * before a single test runs. The `nuxt` environment sets up a real app
 * instance and must keep the real `$fetch`, so this only replaces it when
 * we're not running under that environment.
 */
vi.mock('#build/fetch', async (importOriginal) => {
  const isNuxtEnvironment =
    typeof window !== 'undefined' &&
    (window as Window & { __NUXT_VITEST_ENVIRONMENT__?: boolean })
      .__NUXT_VITEST_ENVIRONMENT__
  if (isNuxtEnvironment) {
    return importOriginal()
  }
  return { $fetch: vi.fn() }
})

/*
 * Global Mock for `extendPromise` in `@scayle/storefront-nuxt`
 *
 * The original `extendPromise` function provided by '@scayle/storefront-nuxt'
 * might perform complex operations, introduce side effects, or have
 * dependencies that are undesirable or difficult to manage during isolated
 * unit/component testing. Running the original implementation could slow
 * down tests, make them flaky, or introduce unwanted behavior irrelevant
 * to the component under test.
 *
 * Solution:
 * Partially mock the '@scayle/storefront-nuxt' module. We use `vi.importActual`
 * to retain all original exports from the module, ensuring that other
 * functionalities relying on it remain unaffected. We then specifically
 * override only the `extendPromise` function with a simplified mock
 * (`vi.fn((_, values) => values)`). This mock immediately returns the provided
 * `values`, bypassing the original logic and potential side effects, while
 * maintaining the expected return signature for test purposes. This provides
 * isolation and predictability for tests interacting with `extendPromise`.
 * =============================================================================
 */
vi.mock('@scayle/storefront-nuxt', async () => {
  // Using 'importActual' to get the real module exports first.
  const actual = await vi.importActual('@scayle/storefront-nuxt')
  // Return all actual exports, but specifically override 'extendPromise'.
  return {
    ...actual,
    extendPromise: vi.fn((_, values) => values),
  }
})

// For unit tests with a Nuxt environment, the `routeTracker` middleware is triggered which causes the tests to fail.
// We're mocking the `routeTracker` middleware with a empty dummy middleware to prevent it from interfering.
// See https://github.com/nuxt/test-utils/issues/526
vi.mock('../modules/tracking/runtime/middleware/routeTracker.ts', () => ({
  // Provide a new default export that is an empty, valid middleware
  default: defineNuxtRouteMiddleware(() => {
    // Do nothing
  }),
}))

vi.mock('#storefront/composables', async () => {
  const actual = await vi.importActual('@scayle/storefront-nuxt/composables')
  return {
    ...actual,
    useLog: () => ({
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    }),
    useCurrentShop: () => {
      return {
        value: {
          requiresConsentManagement: false,
        },
      }
    },
  }
})

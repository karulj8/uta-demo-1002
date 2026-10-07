import { defineNuxtPlugin } from 'nuxt/app'
import type { NuxtApp } from 'nuxt/app'

declare global {
  interface Window {
    /**
     * Exposed for Playwright E2E helpers that read
     * `window.useNuxtApp().$currentShop.shopId`.
     */
    useNuxtApp?: () => NuxtApp
  }
}

/**
 * Exposes `useNuxtApp` on `window` for Playwright E2E.
 *
 * The V2 Playwright suite resolves the active shop via
 * `window.useNuxtApp().$currentShop.shopId`. Nuxt composables are not on
 * `window` by default, so this client plugin bridges that for tests.
 *
 * Dev-only: production builds skip this so visitors do not get `useNuxtApp`
 * on `window`. Playwright against a prod build can still resolve the shop
 * from hydrated `__NUXT__.state.currentShop`.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.dev) {
    return
  }

  window.useNuxtApp = () => nuxtApp
})

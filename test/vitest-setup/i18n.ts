import { config } from '@vue/test-utils'
import { beforeEach } from 'vitest'
import { createI18n } from 'vue-i18n'
import en from '~~/i18n/locales/en_GB.json' with { type: 'json' }
import { tryUseNuxtApp } from '#app/nuxt'

/**
 * Sets up i18n (internationalization) for Vitest test environment.
 *
 * Problem: The `@nuxtjs/i18n` module doesn't automatically create an i18n instance
 * in test environments, causing components and composables that use `useI18n()` to fail.
 * This is a known limitation in `@nuxtjs/i18n` starting with `v8.5.5`.
 *
 * Solution: Manually create an i18n instance and register it as a Vue Test Utils plugin.
 * This makes the i18n instance available to all components during testing, allowing
 * translation functions like `$t()` and `useI18n()` to work correctly.
 *
 * Configuration:
 * - Uses 'en' as the primary locale with English translations from `en_GB.json`
 * - Sets fallback locale to 'en' to prevent falling back to German ('de')
 * - Provides empty message objects for other locales to avoid missing key warnings
 *
 * @see https://github.com/nuxt-modules/i18n/issues/2637
 */
config.global.plugins.push(
  createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages: { en, at: {}, de: {}, ch: {}, 'en-US': {} },
  }),
)

/**
 * Ensures the Nuxt app's i18n locale is set to 'en' if a Nuxt app instance exists.
 * This handles cases where the Nuxt app context is available during testing.
 */
beforeEach(() => {
  const nuxt = tryUseNuxtApp()

  if (nuxt?.$i18n) {
    nuxt.$i18n.locale.value = 'en'
  }
})

import { reactive } from 'vue'
import { useLog } from '#storefront/composables'
import { defineNuxtPlugin } from '#app/nuxt'

/**
 * This plugins provides the consent state and the openConsentManager function to the Nuxt app context.
 * The consent state and openConsentManager function can be set within a specific consent manager adapter plugin.
 *
 * @example
 * ```typescript
 * export default defineNuxtPlugin({
 *   name: 'userCentricsAdapter',
 *   dependsOn: ['consentManager'],
 *   setup() {
 *     const nuxt = useNuxtApp()
 *     nuxt.$consent.state['vendorID'] = true
 *     nuxt.$consent.openConsentManager = () => {
 *       log.debug('Open the consent manager')
 *     }
 *   }
 * })
 * ```
 */
export default defineNuxtPlugin({
  name: 'consentManagerAdapter',
  parallel: true,
  setup() {
    const log = useLog('consentManager')
    const state = reactive<Record<string, boolean>>({})
    return {
      provide: {
        consent: {
          /**
           * The consent state is a record of the consent status for each consent vendor.
           * The key is the consent vendor id and the value is a boolean indicating if the user has given consent for that vendor.
           */
          state,
          /**
           * Opens the consent manager UI.
           */
          openConsentManager: () => {
            log.debug('No consent manager is available')
          },
        },
      },
    }
  },
})

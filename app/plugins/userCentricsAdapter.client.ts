import { onMounted } from 'vue'
import { useEventListener } from '@vueuse/core'
import { useCurrentShop, useLog } from '#storefront/composables'
import { defineNuxtPlugin, useNuxtApp } from '#app/nuxt'

export type DataProcessingService = {
  name: string
  version: string
  category: string
  essential: boolean
  gcm: {
    adStorage: boolean
  }
  consent: {
    given: boolean
    type: string
  }
}
export type UC_CONSENT_EVENT = {
  detail: {
    services: Record<string, DataProcessingService>
  }
}

declare global {
  interface WindowEventMap {
    UC_CONSENT: UC_CONSENT_EVENT
  }

  interface Window {
    UC_UI: { showFirstLayer: () => Promise<void> }
  }
}

/**
 * This plugin is used to adapt the Usercentrics consent manager to the Storefront UI consent manager.
 * It listens to the UC_CONSENT event and maps the event data to the different consent vendors configured in the consent-vendor.config.json file.
 * It also provides the consent state and the openConsentManager function to the Nuxt app context.
 */
export default defineNuxtPlugin({
  name: 'userCentric-manager-adapter',
  dependsOn: ['consentManagerAdapter'],
  setup() {
    const log = useLog('ConsentManagerAdapter')
    const currentShop = useCurrentShop()
    const nuxt = useNuxtApp()

    if (!currentShop.value.requiresConsentManagement) {
      return
    }

    useEventListener('UC_CONSENT', (event: UC_CONSENT_EVENT) => {
      log.debug('Consent was updated:', event)

      Object.entries(event.detail.services).forEach(([vendorId, dps]) => {
        nuxt.$consent.state[vendorId] = dps.consent.given
      })
    })

    nuxt.$consent.openConsentManager = () => {
      if (!window.UC_UI) {
        log.error('Usercentrics is not available')
        return
      }
      window.UC_UI.showFirstLayer()
    }

    onMounted(() => {
      if (!window.UC_UI && currentShop.value.requiresConsentManagement) {
        log.error('Usercentrics is not available')
      }
    })
  },
})

import { ref } from 'vue'
import { type Ref, computed } from 'vue'
import consentVendorConfig from '../../config/consent-vendor.config.json' with { type: 'json' }
import { useCurrentShop, useLog } from '#storefront/composables'
import { useNuxtApp } from '#imports'

type UseConsentReturn = {
  /**
   * The consent state is a boolean indicating if the user has given consent for the consent vendor.
   */
  consent: Ref<boolean>
  /**
   * Opens the consent manager UI.
   */
  openConsentManager: () => Promise<void>
}

/**
 * This composable is used to check if consent is given for a specific third party vendor.
 * When a shop does not require consent management, the consent state is always `true`.
 * When a shop requires consent management, the consent state is determined by the consent manager using the [consent manager adapter plugin]{@link (../plugins/consentManagerAdapter.client.ts)}.
 * In case the consent manager, or a vendor configuration is not available, the consent state is always `false`.
 *
 * @param vendor - The consent vendor to trigger.
 * @returns A composable that returns the consent state and the openConsentManager function.
 */
export function useConsent(
  vendor: keyof typeof consentVendorConfig,
): UseConsentReturn {
  const log = useLog('useConsentTrigger')
  const nuxt = useNuxtApp()
  const currentShop = useCurrentShop()

  if (!currentShop.value.requiresConsentManagement) {
    log.debug('Consent management is not required for this shop')
    return {
      consent: ref(true),
      openConsentManager: () => Promise.resolve(),
    }
  }

  if (!(vendor in consentVendorConfig)) {
    log.warn(`${vendor} is not configured in consentVendorConfig`)
  }

  return {
    consent: computed(() => {
      return nuxt.$consent?.state?.[consentVendorConfig?.[vendor]] ?? false
    }),
    openConsentManager: async () => {
      return nuxt.$consent.openConsentManager()
    },
  }
}

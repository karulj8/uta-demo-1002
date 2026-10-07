import {
  object,
  optional,
  string,
  record,
  union,
  boolean,
  number,
} from 'valibot'
import { useCurrentShop } from '#storefront/composables'
import type { RegistryScriptInput } from '#nuxt-scripts/types'
import { useRegistryScript } from '#nuxt-scripts/utils'

export interface ConsentManagementPlatformApi {}
export const ConsentManagementPlatformOptions = object({
  src: string(),
  scriptTagAttributes: optional(
    record(string(), union([string(), boolean(), number()])),
  ),
})

export type ConsentManagementPlatformInput = RegistryScriptInput<
  typeof ConsentManagementPlatformOptions,
  false
>
/**
 * This composable is used to load the consent management platform script, when the current shop requires consent management.
 *
 * @example
 * ```typescript
 * useConsentManagementPlatform({
 *    src: 'https://web.cmp.usercentrics.eu/ui/loader.js',
 *    scriptTagAttributes: {
 *      id: 'usercentrics-cmp',
 *      'data-settings-id': '<appId>',
 *      async: true,
 *      defer: false,
 *  },
 * })
 * ```
 *
 * @param _options - The options for the consent management platform.
 * @param _options.src - The source of the consent management platform script tag.
 * @param _options.scriptTagAttributes - The attributes for the consent management platform script tag.
 * @returns Returns a script controller object.
 */
export function useConsentManagementPlatform<
  T extends ConsentManagementPlatformApi,
>(_options: ConsentManagementPlatformInput) {
  const currentShop = useCurrentShop()
  return useRegistryScript<T, typeof ConsentManagementPlatformOptions>(
    'consentManagementPlatform',
    (options) => ({
      scriptInput: {
        src: options.src,
        ...options.scriptTagAttributes,
        fetchpriority: 'high',
      },
      schema: import.meta.dev ? ConsentManagementPlatformOptions : undefined,
      scriptOptions: {
        key: 'cmp-script',
        ...(currentShop.value.requiresConsentManagement
          ? {
              trigger: 'client',
              warmupStrategy: 'preload',
            }
          : {
              trigger: 'manual',
            }),
      },
    }),
    _options,
  )
}

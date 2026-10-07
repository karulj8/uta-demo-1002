import { ContentClient } from 'dc-delivery-sdk-js'
import type { AmplienceRuntimeConfig } from '../types'
import { buildAmplienceClientConfig } from '../utils/helpers'
import { useRoute } from '#app/composables/router'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
/**
 * Instantiates the published Amplience Content Delivery 2 client.
 *
 * Localization is content-item based, so the client is not locale-aware: content is
 * fetched by a locale-prefixed delivery key in `useCMSBySlug`. When a `vse` query
 * parameter is present (Amplience preview iframe), the client targets that staging
 * environment so draft content is served instead of published content.
 */
export default defineNuxtPlugin({
  name: 'cms:amplience',
  setup() {
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()
    const cms = runtimeConfig.public.cms as unknown as AmplienceRuntimeConfig

    const client = new ContentClient(buildAmplienceClientConfig(cms, route))

    return {
      provide: {
        amplience: client,
      },
    }
  },
})

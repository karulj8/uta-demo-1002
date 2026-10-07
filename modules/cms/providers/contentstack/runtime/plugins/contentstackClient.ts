import type { Region } from '@contentstack/delivery-sdk'
import contentstack from '@contentstack/delivery-sdk'
import type { IStackSdk } from '@contentstack/live-preview-utils'
import {
  getContentstackEndpoints,
  getRegionForString,
} from '@timbenniks/contentstack-endpoints'
import { isInEditorMode } from '../../utils/utils'
import type { ContentstackRuntimeConfig } from '../../types'
import { useRoute } from '#app/composables/router'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

/**
 * Creates a Contentstack client that automatically initializes the Live Preview mode when in editor mode.
 *
 * @see https://www.contentstack.com/docs/developers/sdks/content-delivery-sdk/typescript/get-started-with-typescript-delivery-sdk
 * @see https://www.contentstack.com/docs/developers/set-up-live-preview/set-up-live-preview-with-rest-for-client-side-rendering
 */
export default defineNuxtPlugin({
  name: 'cms:contentstack',
  async setup() {
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()
    const cms = runtimeConfig.public.cms as unknown as ContentstackRuntimeConfig

    const isInEditor = isInEditorMode(route)
    const region = getRegionForString(cms.region) as unknown as Region
    const endpoints = getContentstackEndpoints(region, true)

    const stack = contentstack.stack({
      apiKey: cms.accessToken,
      deliveryToken: cms.deliveryAccessToken,
      environment: cms.environment,
      region: region,
      host: endpoints.contentDelivery,
      branch: cms.branch || undefined,
      live_preview: {
        enable: isInEditor,
        preview_token: cms.previewAccessToken,
        host: endpoints.preview,
      },
    })

    if (isInEditor && import.meta.client) {
      const ContentstackLivePreview = (
        await import('@contentstack/live-preview-utils')
      ).default
      ContentstackLivePreview.init({
        enable: isInEditor,
        ssr: false,
        mode: 'builder',
        stackSdk: stack.config as unknown as IStackSdk,
        editButton: {
          enable: true,
          exclude: ['outsideLivePreviewPortal'],
        },
        stackDetails: {
          apiKey: cms.accessToken,
          environment: cms.environment,
          branch: cms.branch || undefined,
        },

        clientUrlParams: {
          host: endpoints.application,
        },
      })
    }

    return {
      provide: {
        contentstack: {
          stack,
        },
      },
    }
  },
})

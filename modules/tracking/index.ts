import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addRouteMiddleware,
} from '@nuxt/kit'
import type { PageType } from './runtime/types/tracking'

// Module options TypeScript interface definition
export interface ModuleOptions {}

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    tracking: {
      gtm: {
        /** GTM container ID (format: GTM-XXXXXX) */
        id: string
        /**
         * Authentication token for environment-specific container versions
         *
         * @see https://developers.google.com/tag-platform/tag-manager/api/v2/authorization
         */
        auth?: string
        /**
         * Preview environment name
         *
         * @see https://support.google.com/tagmanager/answer/6107056?hl=en&sjid=11299576144905634561-EU
         */
        preview?: string
        /** Forces GTM cookies to take precedence when true */
        cookiesWin?: boolean | 'x'
        /**
         * Enables debug mode when true
         *
         * @see https://support.google.com/tagmanager/answer/6107056?hl=en#
         */
        debug?: boolean | 'x'
        /**
         * Environment name for environment-specific container
         *
         * @see https://support.google.com/tagmanager/answer/6311518?hl=en
         */
        envName?: string
        /** Referrer policy for analytics requests */
        authReferrerPolicy?: string
      }
    }
  }
}

declare module '#app' {
  interface PageMeta {
    pageType: PageType
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@scayle/nuxt-tracking',
    configKey: 'tracking',
    compatibility: {
      nuxt: '>=3.13.0',
    },
  },
  setup(_, nuxt) {
    const resolver = createResolver(import.meta.url)

    addPlugin(resolver.resolve('./runtime/plugins/gtm.client.ts'))

    addRouteMiddleware({
      name: 'setupTrackingContext',
      path: resolver.resolve(
        './runtime/middleware/setupTrackingContext.global.ts',
      ),
      global: true,
    })

    addRouteMiddleware({
      name: 'routeTracker',
      path: resolver.resolve('./runtime/middleware/routeTracker.global.ts'),
      global: true,
    })

    nuxt.options.alias['#tracking/composables'] = resolver.resolve(
      './runtime/composables',
    )
    nuxt.options.alias['#tracking/types'] = resolver.resolve('./runtime/types')
  },
})

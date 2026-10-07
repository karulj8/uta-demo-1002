import { createResolver, defineNuxtModule } from '@nuxt/kit'

/**
 * Responsive breakpoint values in pixels, keyed by size name.
 */
export type Breakpoints = Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>

/**
 * Configuration options for the local Storefront UI module.
 */
export type ModuleOptions = {
  /**
   * Optional prefix for component names.
   * @deprecated Currently not implemented.
   */
  prefix?: string
  /**
   * Custom breakpoint configuration for responsive design.
   * Falls back to default breakpoints if not provided: xs(320), sm(640), md(768), lg(1024), xl(1280).
   */
  breakpoints?: Breakpoints
}

/**
 * Local Storefront UI Module for Nuxt.
 *
 * Provides a comprehensive set of UI components, composables, and directives
 * for building e-commerce storefronts. Includes components for form elements,
 * modals, notifications, pagination, and more.
 *
 * @example
 * ```ts
 * // nuxt.config.ts
 * export default defineNuxtConfig({
 *   modules: ['./modules/ui'],
 *   'storefront-ui': {
 *     breakpoints: {
 *       xs: 320,
 *       sm: 640,
 *       md: 768,
 *       lg: 1024,
 *       xl: 1280,
 *     }
 *   }
 * })
 * ```
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@scayle/storefront-ui',
    configKey: 'storefront-ui',
    version: '0.1.0',
    compatibility: {
      nuxt: '>=3.10',
    },
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public.storefrontUI = {
      breakpoints: options.breakpoints ?? {
        xs: 320,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
      },
    }

    nuxt.options.alias['#storefront-ui'] = resolve('./runtime')
    nuxt.options.alias['#storefront-ui/components'] = resolve(
      './runtime/components',
    )
  },
})

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    storefrontUI: {
      breakpoints: Breakpoints
    }
  }
}

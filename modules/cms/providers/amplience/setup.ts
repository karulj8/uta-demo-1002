import {
  addComponentsDir,
  addPlugin,
  addRouteMiddleware,
  addTypeTemplate,
  createResolver,
} from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import type { ModuleOptions } from '../../types'
import { logger } from '../../utils/helpers'
import { CMSProvider } from '../../utils/config'
import type { AmplienceModuleOptions, AmplienceRuntimeConfig } from './types'

/**
 * Sets up the Amplience CMS integration for the Nuxt application.
 *
 * This function:
 * - Validates required configuration (hub name)
 * - Registers the Amplience Content Delivery client plugin
 * - Registers global PLP visualization preview middleware
 * - Adds CMS components and utility aliases to the application
 * - Generates TypeScript type definitions for Amplience content types
 *
 * @param options - The CMS module options
 * @param nuxt - The Nuxt instance
 *
 * @throws Logs error if required hub name is missing
 */
export const setupAmplience = (_options: ModuleOptions, nuxt: Nuxt) => {
  const resolver = createResolver(import.meta.url)
  logger.info('Using Amplience as Storefront CMS provider')

  const runtimeCMS = nuxt.options.runtimeConfig?.public
    .cms as unknown as AmplienceRuntimeConfig

  if (
    runtimeCMS.hubName === undefined &&
    !import.meta.env.NUXT_PUBLIC_CMS_HUB_NAME
  ) {
    logger.error('Missing Amplience hubName')
  }

  addPlugin(resolver.resolve('./runtime/plugin.ts'))

  addRouteMiddleware({
    name: 'ampliencePlpPreview',
    path: resolver.resolve(
      './runtime/middleware/ampliencePlpPreview.global.ts',
    ),
    global: true,
  })

  nuxt.options.alias['#storefront-cms/components'] =
    resolver.resolve('./components')

  nuxt.options.alias['#storefront-cms/utils'] =
    resolver.resolve('./utils/index')

  addComponentsDir({
    path: resolver.resolve('./components'),
    pathPrefix: false,
  })

  addTypeTemplate({
    filename: 'cms-types.d.ts',
    src: resolver.resolve('./types/index.ts'),
  })

  addTypeTemplate({
    filename: 'storefront-cms.d.ts',
    write: true,
    getContents: () => {
      return `
      import type { AmplienceRuntimeConfig } from '${resolver.resolve(
        './types/index.ts',
      )}'
      declare module '@nuxt/schema' {
        interface RuntimeConfig {
          cms: AmplienceRuntimeConfig
        }
        interface PublicRuntimeConfig {
          cms: AmplienceRuntimeConfig
        }
      }
      export {}
      `
    },
  })
}

/**
 * Type guard to check if the CMS module options are for Amplience.
 *
 * @param options - The CMS module options to check
 * @returns `true` if the provider is Amplience, `false` otherwise
 */
export function isProviderAmplience(
  options: ModuleOptions,
): options is AmplienceModuleOptions {
  return options.provider === CMSProvider.AMPLIENCE
}

/**
 * Configures the Nuxt image module for Amplience Dynamic Media assets.
 *
 * This function:
 * - Adds Amplience CDN domains to allowed image domains
 * - Registers the custom Amplience image provider with default modifiers
 *
 * The configuration enables optimized image delivery from Amplience Dynamic Media
 * with automatic format conversion and quality settings.
 *
 * @param nuxt - The Nuxt instance
 */
export function setupAmplienceImageProvider(nuxt: Nuxt) {
  if (nuxt.options.image === false) {
    return
  }

  nuxt.options.image.domains ??= []

  const amplienceDomains = ['cdn.media.amplience.net', 'i1.adis.ws']

  for (const domain of amplienceDomains) {
    if (!nuxt.options.image.domains.includes(domain)) {
      nuxt.options.image.domains.push(domain)
    }
  }

  const resolver = createResolver(import.meta.url)
  nuxt.options.image.providers.amplience ??= {
    name: 'amplience',
    provider: resolver.resolve('./runtime/imageprovider/index.ts'),
    options: {
      modifiers: {
        quality: 'default',
        format: 'auto',
      },
    },
  }
}

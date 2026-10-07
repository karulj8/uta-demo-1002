import {
  addComponentsDir,
  addPlugin,
  addTypeTemplate,
  createResolver,
  installModule,
} from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { logger } from '../../utils/helpers'
import type { ModuleOptions } from '../../types'
import { CMSProvider } from '../../utils/config'
import type { StoryblokModuleOptions } from './types'

/**
 * Sets up the Storyblok CMS integration for the Nuxt application.
 *
 * This function:
 * - Installs and configures the `@storyblok/nuxt` module with sudo mode
 * - Validates required configuration (access token)
 * - Registers the Storyblok client plugin
 * - Adds CMS components to the application
 * - Generates TypeScript type definitions for Storyblok content types
 *
 * @param options - The CMS module options
 * @param nuxt - The Nuxt instance
 *
 * @throws Logs error if required access token is missing
 */
export async function setupStoryblok(options: ModuleOptions, nuxt: Nuxt) {
  const resolver = createResolver(import.meta.url)
  logger.info('Using Storyblok as Storefront CMS provider')

  const runtimeCMS = nuxt.options.runtimeConfig?.public.cms

  // Install `@storyblok/nuxt` module with sudo mode enabled.
  // Sudo mode prevents duplicate initialization since we define our own plugin.
  if (!nuxt.options.modules.includes('@storyblok/nuxt')) {
    await installModule('@storyblok/nuxt', {
      componentsDir: '',
      enableSudoMode: true,
    })
  }

  // Configure Storyblok options to disable automatic component directory scanning.
  if ('storyblok' in nuxt.options) {
    nuxt.options.storyblok = nuxt.options.storyblok
      ? ({
        ...nuxt.options.storyblok,
        componentsDir: '',
      } as unknown as typeof nuxt.options.storyblok)
      : ({} as unknown as typeof nuxt.options.storyblok)
  }

  // Validate required configuration
  if (
    runtimeCMS.accessToken === undefined &&
    !import.meta.env.NUXT_PUBLIC_CMS_ACCESS_TOKEN
  ) {
    logger.error('Missing Storyblok accessToken')
  }

  // Register Storyblok client plugin
  addPlugin(resolver.resolve('./runtime/plugin'))

  // Add CMS components to the application
  nuxt.options.alias['#storefront-cms/components'] =
    resolver.resolve('./components')

  addComponentsDir({
    path: resolver.resolve('./components'),
    pathPrefix: false,
  })

  nuxt.options.alias['#storefront-cms/utils'] =
    resolver.resolve('./utils/index')

  // Add TypeScript type definitions for generated Storyblok types
  addTypeTemplate({
    filename: 'cms-storyblok.d.ts',
    src: resolver.resolve('./types/gen/storyblok.d.ts'),
  })

  addTypeTemplate({
    filename: 'cms-storyblok-components.d.ts',
    src: resolver.resolve('./types/gen/components/storyblok-components.d.ts'),
  })

  addTypeTemplate({
    filename: 'cms-types.d.ts',
    src: resolver.resolve('./types/index.ts'),
  })

  // Add module augmentation for runtime config types
  addTypeTemplate({
    filename: 'storefront-cms.d.ts',
    write: true,
    getContents: () => {
      return `
      import { StoryblokRuntimeConfig } from '${resolver.resolve(
        './types/index.ts',
      )}'

      declare module '@nuxt/schema' {
        interface RuntimeConfig {
          cms: StoryblokRuntimeConfig
        }
        interface PublicRuntimeConfig {
          cms: StoryblokRuntimeConfig
        }
      }
      export {}
      `
    },
  })
}

/**
 * Type guard to check if the CMS module options are for Storyblok.
 *
 * @param options - The CMS module options to check
 *
 * @returns `true` if the provider is Storyblok, `false` otherwise
 */
export function isProviderStoryblok(
  options: ModuleOptions,
): options is StoryblokModuleOptions {
  return options.provider === CMSProvider.STORYBLOK
}

/**
 * Configures the Nuxt image module for Storyblok assets.
 *
 * This function:
 * - Adds the Storyblok assets domain to allowed image domains
 * - Configures default image modifiers (quality and format)
 *
 * The configuration enables optimized image delivery from Storyblok's CDN
 * with automatic format conversion (AVIF) and quality settings.
 *
 * @param nuxt The Nuxt instance
 */
export function setupStoryblokImageProvider(nuxt: Nuxt) {
  const storyblokCdnDomain = 'https://a.storyblok.com'
  if (nuxt.options.image === false) {
    return
  }

  nuxt.options.image.domains ??= []

  if (!nuxt.options.image.domains.includes(storyblokCdnDomain)) {
    nuxt.options.image.domains.push(storyblokCdnDomain)
  }

  nuxt.options.image.storyblok ??= {
    baseURL: storyblokCdnDomain,
    modifiers: {
      filters: {
        quality: '85',
        format: 'avif',
      },
    },
  }
}

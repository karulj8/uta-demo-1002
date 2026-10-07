import {
  addComponentsDir,
  addPlugin,
  addTypeTemplate,
  createResolver,
  updateRuntimeConfig,
} from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { CMSProvider } from '../../utils/config'
import { logger } from '../../utils/helpers'
import type { ModuleOptions } from '../../types'
import type { ContentfulModuleOptions, ContentfulRuntimeConfig } from './types'

/**
 * Sets up the Contentful CMS integration for the Nuxt application.
 *
 * This function:
 * - Configures runtime config with default hosts for Contentful API
 * - Validates required configuration (access token and space ID)
 * - Registers the Contentful client plugin
 * - Adds CMS components to the application
 * - Generates TypeScript type definitions for Contentful content types
 *
 * @param options - The CMS module options
 * @param nuxt - The Nuxt instance
 *
 * @throws Logs error if required access token or space ID is missing
 */
export async function setupContentful(options: ModuleOptions, nuxt: Nuxt) {
  const resolver = createResolver(import.meta.url)
  logger.info('Using Contentful as Storefront CMS provider')

  // Set default hosts for Contentful API. The CMS runtime config is globally
  // typed as the active provider's shape, so cast it to Contentful's config.
  const runtimeCMS = (nuxt.options.runtimeConfig.public
    .cms as ContentfulRuntimeConfig)
  await updateRuntimeConfig({
    public: {
      cms: {
        host: runtimeCMS.host || 'cdn.contentful.com',
        previewHost: runtimeCMS.previewHost || 'preview.contentful.com',
      }
    }
  })
  // Validate required configuration
  if (
    runtimeCMS.accessToken === undefined &&
    !import.meta.env.NUXT_PUBLIC_CMS_ACCESS_TOKEN
  ) {
    logger.error('Missing Contentful accessToken')
  }
  if (
    runtimeCMS.space === undefined &&
    !import.meta.env.NUXT_PUBLIC_CMS_SPACE
  ) {
    logger.error('Missing Contentful spaceId')
  }

  // Register Contentful client plugin
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

  // Add TypeScript type definitions for generated Contentful types
  addTypeTemplate({
    filename: 'cms-generated.d.ts',
    src: resolver.resolve('./types/gen/index.ts'),
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
      import { ContentfulRuntimeConfig } from '${resolver.resolve(
        './types/index.ts',
      )}'
      declare module '@nuxt/schema' {
        interface RuntimeConfig {
          cms: ContentfulRuntimeConfig
        }
        interface PublicRuntimeConfig {
          cms: ContentfulRuntimeConfig
        }
      }

      export {}
      `
    },
  })
}

/**
 * Type guard to check if the CMS module options are for Contentful.
 *
 * @param options - The CMS module options to check
 * @returns `true` if the provider is Contentful, `false` otherwise
 */
export function isProviderContentful(
  options: ModuleOptions,
): options is ContentfulModuleOptions {
  return options.provider === CMSProvider.CONTENTFUL
}

/**
 * Configures the Nuxt image module for Contentful assets.
 *
 * This function:
 * - Adds the Contentful assets domain to allowed image domains
 * - Configures default image modifiers (quality and format)
 *
 * The configuration enables optimized image delivery from Contentful's CDN
 * with automatic format conversion (AVIF) and quality settings.
 *
 * @param nuxt - The Nuxt instance
 */
export function setupContentfulImageProvider(nuxt: Nuxt) {
  const contentfulCdnDomain = 'https://images.ctfassets.net'

  if (nuxt.options.image === false) {
    return
  }

  nuxt.options.image.domains ??= []

  if (!nuxt.options.image.domains.includes(contentfulCdnDomain)) {
    nuxt.options.image.domains.push(contentfulCdnDomain)
  }

  nuxt.options.image.contentful ??= {
    baseURL: contentfulCdnDomain,
    // @ts-expect-error - ContentfulOptions from @nuxt/image does not have modifiers
    modifiers: {
      quality: '85',
      format: 'avif',
    },
  }
}

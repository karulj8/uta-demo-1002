import {
  addComponentsDir,
  addPlugin,
  addTypeTemplate,
  createResolver,
} from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import {
  getContentstackEndpoints,
  getRegionForString,
} from '@timbenniks/contentstack-endpoints'
import type { ModuleOptions } from '../../types'
import { logger } from '../../utils/helpers'
import { CMSProvider } from '../../utils/config'
import type {
  ContentstackModuleOptions,
  ContentstackRuntimeConfig,
} from './types'

export const setupContentstack = (_options: ModuleOptions, nuxt: Nuxt) => {
  const resolver = createResolver(import.meta.url)
  logger.info('Using Contentstack as Storefront CMS provider')

  const runtimeCMS = nuxt.options.runtimeConfig?.public
    .cms as unknown as ContentstackRuntimeConfig

  // Validate required configuration
  if (
    runtimeCMS.accessToken === undefined &&
    !import.meta.env.NUXT_PUBLIC_CMS_ACCESS_TOKEN
  ) {
    logger.error('Missing Contentstack accessToken')
  }

  if (
    runtimeCMS.deliveryAccessToken === undefined &&
    !import.meta.env.NUXT_PUBLIC_CMS_DELIVERY_TOKEN
  ) {
    logger.error('Missing Contentstack deliveryToken')
  }

  if (
    runtimeCMS.previewAccessToken === undefined &&
    !import.meta.env.NUXT_PUBLIC_CMS_PREVIEW_TOKEN
  ) {
    logger.error('Missing Contentstack previewToken')
  }

  if (
    runtimeCMS.environment === undefined &&
    !import.meta.env.NUXT_PUBLIC_CMS_ENVIRONMENT
  ) {
    logger.error('Missing Contentstack environment')
  }

  if (
    runtimeCMS.region === undefined &&
    !import.meta.env.NUXT_PUBLIC_CMS_REGION
  ) {
    logger.error('Missing Contentstack region')
  }

  const region = getRegionForString(runtimeCMS.region)
  if (!region) {
    logger.error('Invalid region')
  }

  nuxt.options.build = nuxt.options.build || {}
  nuxt.options.build.transpile = nuxt.options.build.transpile || []

  // Transpile Contentstack packages for ESM support
  const contentstackPackages = [
    '@contentstack/core',
    '@contentstack/utils',
    '@contentstack/delivery-sdk',
    '@contentstack/live-preview-utils',
    'lodash',
  ]

  contentstackPackages.forEach((dep) => {
    if (!nuxt.options.build.transpile.includes(dep)) {
      nuxt.options.build.transpile.push(dep)
    }
  })

  // Nitro/SSR-only: bundle these CommonJS packages into the server build
  // during tests instead of leaving them external, so Vitest's Node-based
  // SSR runner doesn't have to resolve them via Node's own module loader.
  nuxt.options.vite ??= {}
  if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
    nuxt.options.vite.ssr ??= {}
    const noExternal = Array.isArray(nuxt.options.vite.ssr.noExternal)
      ? nuxt.options.vite.ssr.noExternal
      : []
    nuxt.options.vite.ssr.noExternal = noExternal

    const ssrBundledPackages = [
      '@contentstack/delivery-sdk',
      '@contentstack/live-preview-utils',
      '@contentstack/core',
      '@contentstack/utils',
    ]

    ssrBundledPackages.forEach((dep) => {
      if (!noExternal.includes(dep)) {
        noExternal.push(dep)
      }
    })
  }

  // Client dev-server only: these Contentstack packages aren't pre-bundled by
  // default, so Vite serves them straight from node_modules via /@fs/. Each
  // has its own nested CommonJS dependency reached via a bare import
  // (@contentstack/delivery-sdk -> @contentstack/utils; @contentstack/core ->
  // its nested qs@6.15.2), which then hits the browser's native ESM loader
  // with no CJS interop applied, crashing with either "does not provide an
  // export named ..." or "require is not defined". Nuxt also auto-excludes
  // all of them from optimizeDeps because they're in build.transpile above
  // (@nuxt/vite-builder mirrors build.transpile into optimizeDeps.exclude
  // for the client environment) — so both the include and the exclude
  // removal are required here.
  nuxt.hooks.hook('vite:extendConfig', (config, { isClient }) => {
    if (!isClient) {
      return
    }

    const cjsInteropDeps = [
      '@contentstack/delivery-sdk',
      '@contentstack/utils',
      '@contentstack/core',
    ]

    // `config` (and `config.optimizeDeps`) are typed Readonly, but Nuxt's
    // client Vite environment always initializes optimizeDeps.include/exclude
    // as real arrays, so we mutate them in place rather than reassigning.
    const optimizeDeps = config.optimizeDeps as
      { include?: string[]; exclude?: string[] } | undefined
    const include = optimizeDeps?.include
    const exclude = optimizeDeps?.exclude

    cjsInteropDeps.forEach((dep) => {
      if (include && !include.includes(dep)) {
        include.push(dep)
      }

      const excludeIndex = exclude?.indexOf(dep) ?? -1
      if (exclude && excludeIndex !== -1) {
        exclude.splice(excludeIndex, 1)
      }
    })
  })

  addPlugin(resolver.resolve('./runtime/plugins/contentstackClient'))

  nuxt.options.alias['#storefront-cms/components'] =
    resolver.resolve('./components')

  nuxt.options.alias['#storefront-cms/utils'] =
    resolver.resolve('./utils/utils')

  addComponentsDir({
    path: resolver.resolve('./components'),
    pathPrefix: false,
  })

  addTypeTemplate({
    filename: 'cms-generated.d.ts',
    src: resolver.resolve('./types/gen/contentstack.d.ts'),
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
      import { ContentstackRuntimeConfig } from '${resolver.resolve(
        './types/index.ts',
      )}'
      declare module '@nuxt/schema' {
        interface RuntimeConfig {
          cms: ContentstackRuntimeConfig
        }
        interface PublicRuntimeConfig {
          cms: ContentstackRuntimeConfig
        }
      }
      declare module '#build/cms-generated' {
        export interface SystemFields {
          $: Record<string, object>
        }
      }
      export {}
      `
    },
  })
}

/**
 * Type guard to check if the CMS module options are for Contentstack.
 *
 * @param options - The CMS module options to check
 * @returns `true` if the provider is Contentstack, `false` otherwise
 */
export function isProviderContentstack(
  options: ModuleOptions,
): options is ContentstackModuleOptions {
  return options.provider === CMSProvider.CONTENTSTACK
}

export async function setupContentstackImageProvider(nuxt: Nuxt) {
  const region = getRegionForString(
    (
      nuxt.options.runtimeConfig?.public
        .cms as unknown as ContentstackRuntimeConfig
    ).region,
  )
  const endpoints = getContentstackEndpoints(region, true)
  const contentstackCdnDomain = endpoints.images || 'images.contentstack.io'

  if (nuxt.options.image === false) {
    return
  }

  nuxt.options.image.domains ??= []

  if (!nuxt.options.image.domains.includes(contentstackCdnDomain)) {
    nuxt.options.image.domains.push(contentstackCdnDomain)
  }

  const resolver = createResolver(import.meta.url)
  nuxt.options.image.providers.contentstack ??= {
    name: 'contentstack',
    provider: resolver.resolve('./runtime/imageprovider/index.ts'),
    options: {
      baseURL: contentstackCdnDomain,
      modifiers: {
        quality: '85',
        format: 'avif',
      },
    },
  }
}

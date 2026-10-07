import type { CreateClientParams } from 'contentful'

/**
 * Keys from Contentful's `CreateClientParams` that are required in the runtime config.
 */
export type ContentfulRuntimeConfigKeys = 'accessToken' | 'space' | 'host'

/**
 * Module options for configuring the Contentful CMS integration.
 *
 * Extends Contentful's CreateClientParams with provider-specific settings.
 */
export type ContentfulModuleOptions = {
  /** Identifies this as a Contentful provider configuration */
  provider: 'contentful'
} & Omit<Partial<CreateClientParams>, ContentfulRuntimeConfigKeys>

/**
 * Runtime configuration for the Contentful CMS integration.
 *
 * This configuration is available at runtime via `useRuntimeConfig().public.cms`
 * and can be set using environment variables (e.g., `NUXT_PUBLIC_CMS_ACCESS_TOKEN`).
 */
export type ContentfulRuntimeConfig = Pick<
  CreateClientParams,
  ContentfulRuntimeConfigKeys
> & {
  /**
   * Access token for Contentful Preview API.
   * Used when `allowDrafts` is true and in editor mode.
   *
   * @env NUXT_PUBLIC_CMS_PREVIEW_ACCESS_TOKEN
   */
  previewAccessToken?: string

  /**
   * Host for Contentful Preview API.
   * Defaults to 'preview.contentful.com'.
   *
   * @env NUXT_PUBLIC_CMS_PREVIEW_HOST
   * @default 'preview.contentful.com'
   */
  previewHost?: string

  /**
   * Host for Contentful Delivery API.
   * Defaults to 'cdn.contentful.com'.
   *
   * @env NUXT_PUBLIC_CMS_HOST
   * @default 'cdn.contentful.com'
   */
  host?: string

  /**
   * Whether to allow fetching draft content in editor mode.
   * When true, preview access token and preview host are used.
   *
   * @env NUXT_PUBLIC_CMS_ALLOW_DRAFTS
   * @default false
   */
  allowDrafts?: boolean
}

export * from './gen'

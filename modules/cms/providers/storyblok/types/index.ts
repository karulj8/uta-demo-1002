import type { ModuleOptions as StoryblokModuleProps } from '@storyblok/nuxt'

/**
 * Keys from Storyblok's ModuleOptions that are required in the runtime config.
 */
export type StoryblokRuntimeConfigKeys = 'accessToken'

/**
 * Module options for configuring the Storyblok CMS integration.
 *
 * Extends Storyblok's ModuleOptions with provider-specific settings.
 */
export type StoryblokModuleOptions = {
  /** Identifies this as a Storyblok provider configuration */
  provider: 'storyblok'
} & Omit<Partial<StoryblokModuleProps>, StoryblokRuntimeConfigKeys>

/**
 * Runtime configuration for the Storyblok CMS integration.
 *
 * This configuration is available at runtime via `useRuntimeConfig().public.cms`
 * and can be set using environment variables (e.g., `NUXT_PUBLIC_CMS_ACCESS_TOKEN`).
 */
export type StoryblokRuntimeConfig = Pick<
  StoryblokModuleProps,
  StoryblokRuntimeConfigKeys
> & {
  /**
   * Whether to allow fetching draft content in editor mode.
   * When `true`, draft version is used instead of published.
   *
   * @env NUXT_PUBLIC_CMS_ALLOW_DRAFTS
   * @default false
   */
  allowDrafts?: boolean

  /**
   * Optional custom mapping of i18n locale codes to Storyblok folder names.
   * By default, the i18n locale code is used as the folder name (e.g., `de` → `de/`).
   * Use this to map locale codes to different folder names in Storyblok.
   *
   * @example
   * ```typescript
   * // Map German locale to 'german' folder in Storyblok
   * folderMapping: {
   *   de: 'german',
   *   en: 'english',
   *   ch: 'switzerland'
   * }
   * ```
   */
  folderMapping?: Record<string, string>
}

export type * from './gen/components/storyblok-components.d'

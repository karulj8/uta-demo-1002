/**
 * Supported CMS providers for the Storefront Application local CMS module.
 *
 * Used to identify and configure the CMS integration in module options.
 *
 * @example
 * ```typescript
 * // In modules/cms/providers/contentful/setup.ts
 * export function isProviderContentful(
 *   options: ModuleOptions,
 * ): options is ContentfulModuleOptions {
 *   return options.provider === CMSProvider.CONTENTFUL
 * }
 * ```
 */
export const CMSProvider = {
  STORYBLOK: 'storyblok',
  CONTENTFUL: 'contentful',
  CONTENTSTACK: 'contentstack',
  AMPLIENCE: 'amplience',
  /** SCAYLE CMS placeholder provider */
  SCAYLE: 'scayle',
} as const

export type CMSProvider = (typeof CMSProvider)[keyof typeof CMSProvider]

import { type MaybeRefOrGetter, toValue } from 'vue'

/**
 * Checks if the code is running on the client side.
 * This wrapper is needed to mock the `import.meta.client` during tests.
 *
 * @returns `true` if the code is running on the client side, `false` otherwise.
 */
export const isClientSide = () => {
  return import.meta.client
}
/**
 * Generates hreflang links for a Contentstack page.
 *
 * @param contentstackLinks - A list of Contentstack page alternates for all shops.
 * @param defaultLocale - The default locale of the store.
 *
 * @returns An array of hreflang links.
 */
export const generateContentstackHreflangLinks = (
  contentfulLinks: MaybeRefOrGetter<
    { locale: string; href: string; path: string }[] | undefined
  >,
  defaultLocale: string,
): { rel: 'alternate'; hreflang: string; href: string }[] => {
  const links = toValue(contentfulLinks)
  if (!links?.length) {
    return []
  }

  return links.flatMap(({ locale, href, path }) => {
    const link = { rel: 'alternate' as const, hreflang: locale, href }

    return path === defaultLocale
      ? [link, { rel: 'alternate' as const, hreflang: 'x-default', href }]
      : [link]
  })
}

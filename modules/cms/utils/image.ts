import type { $Img } from '@nuxt/image'
import { BREAKPOINTS } from '~~/config/ui'

/**
 * Generates responsive image sources with optimized formats for a single image.
 *
 * Creates multiple source variants (AVIF, JPEG/PNG) with appropriate media queries.
 *
 * @param imgSrc - Image URL from CMS
 * @param isMobile - Whether this source is for mobile viewports
 * @param mobileBreakpoint - Breakpoint width separating mobile/desktop
 * @param provider - CMS provider ('storyblok' or 'contentful')
 * @param img - Nuxt Image instance for generating optimized URLs
 * @param responsiveSizes - Size string for `srcset` attribute (e.g., 'xs:100vw md:50vw')
 * @returns Array of source objects with srcset, type, and media queries
 */
const getSources = (
  imgSrc: string,
  isMobile: boolean,
  mobileBreakpoint: number,
  provider: 'storyblok' | 'contentful' | 'contentstack' | 'amplience',
  img: $Img,
  responsiveSizes: string,
) => {
  const originalFormat = imgSrc.match(/^[^?#]+\.(\w+)(?:$|[?#])/)?.[1]

  const isNotTransparent =
    !originalFormat ||
    !['png', 'webp', 'gif', 'svg', 'avif'].includes(originalFormat)
  const legacyFormat = isNotTransparent ? 'jpeg' : 'png'

  const formats = img.options.format?.length
    ? [...img.options.format]
    : ['avif']

  if (!formats.includes(legacyFormat)) {
    formats.push(legacyFormat)
  } else {
    formats.splice(formats.indexOf(legacyFormat), 1)
    formats.push(legacyFormat)
  }

  return formats.map((format) => {
    const { srcset, sizes, src } = img.getSizes(imgSrc, {
      // @ts-expect-error - Ignore until https://github.com/nuxt/image/issues/2036 is fixed
      provider,
      sizes: responsiveSizes,
      modifiers: { format },
    })

    return {
      src,
      type: `image/${format}`,
      sizes,
      srcset,
      media: isMobile
        ? `(width < ${mobileBreakpoint}px)`
        : `(width >= ${mobileBreakpoint}px)`,
    }
  })
}

/**
 * Image source object compatible with `<picture>` element.
 */
export type Source = {
  /** Base image URL */
  src?: string
  /** Responsive srcset with multiple sizes */
  srcset?: string
  /** MIME type (e.g., 'image/avif', 'image/jpeg') */
  type?: string
  /** Size descriptors for srcset (e.g., '100vw', '(min-width: 768px) 50vw') */
  sizes?: string
  /** Media query for when this source applies */
  media?: string
}

/**
 * Generates optimized sources for responsive images with mobile/desktop variants.
 *
 * Merges mobile and desktop sources when identical, removing redundant media queries.
 * Used in CMS components for background images and video posters.
 *
 * @param desktopImage - Desktop image URL from CMS
 * @param mobileImage - Mobile image URL from CMS (fallback to desktop if omitted)
 * @param mobileBreakpoint - Breakpoint separating mobile/desktop (typically `breakpoints.lg`)
 * @param provider - CMS provider ('storyblok' or 'contentful')
 * @param img - Nuxt Image instance
 * @param sizes - Responsive sizes string (default: full viewport width)
 * @returns Merged array of optimized sources for `<picture>` element
 *
 * @example
 * ```typescript
 * const sources = getImageSources(
 *   'https://cdn.contentful.com/desktop.jpg',
 *   'https://cdn.contentful.com/mobile.jpg',
 *   1024,
 *   'contentful',
 *   $img,
 *   'xs:100vw lg:50vw'
 * )
 * ```
 */
export const getImageSources = (
  desktopImage: string,
  mobileImage: string,
  mobileBreakpoint: number,
  provider: 'storyblok' | 'contentful' | 'contentstack' | 'amplience',
  img: $Img,
  sizes: string = 'xs:100vw sm:100vw md:100vw lg:100vw xl:100vw',
) => {
  const desktopSources = getSources(
    desktopImage,
    false,
    mobileBreakpoint,
    provider,
    img,
    sizes,
  )
  const mobileSources = getSources(
    mobileImage,
    true,
    mobileBreakpoint,
    provider,
    img,
    sizes,
  )

  // combine mobile and desktop sources, when the same source is present in both
  const mergedSources: Source[] = []
  for (const src of [...mobileSources, ...desktopSources]) {
    const existingIdx = mergedSources.findIndex(
      (s) =>
        s.src === src.src &&
        s.srcset === src.srcset &&
        s.type === src.type &&
        s.sizes === src.sizes,
    )

    if (existingIdx !== -1) {
      mergedSources[existingIdx] = {
        ...mergedSources[existingIdx],
        media: undefined,
      }
    } else {
      mergedSources.push({ ...src })
    }
  }

  return mergedSources
}

/**
 * Calculates responsive size descriptors for images based on viewport fractions.
 *
 * Generates a sizes string for each breakpoint (xs, sm, md, lg, xl) using either
 * viewport widths (vw) or absolute pixel values.
 *
 * @param desktopFraction - Viewport fraction for desktop (lg, xl). Default: 1 (100%)
 * @param mobileFraction - Viewport fraction for mobile (xs, sm, md). Default: 1 (100%)
 * @param maxWidths - Optional maximum pixel widths per breakpoint
 * @returns Sizes string for `srcset` attribute (e.g., 'xs:100vw sm:100vw md:50vw lg:800px xl:1200px')
 *
 * @example
 * ```typescript
 * // Full width on mobile, half width on desktop
 * getImageSizes(0.5, 1) // 'xs:100vw sm:100vw md:100vw lg:50vw xl:50vw'
 *
 * // With max widths
 * getImageSizes(0.5, 1, { lg: 800, xl: 1200 })
 * // 'xs:100vw sm:100vw md:100vw lg:400px xl:600px'
 * ```
 */
export const getImageSizes = (
  desktopFraction: number = 1,
  mobileFraction: number = 1,
  maxWidths: Partial<Record<keyof typeof BREAKPOINTS, number>> = {},
) => {
  const mobileSize = 100 * (mobileFraction || 1)
  const desktopSize = 100 * (desktopFraction || 1)
  const sizes: string[] = []

  for (const breakpoint of Object.keys(BREAKPOINTS)) {
    const maxWidth = maxWidths[breakpoint as keyof typeof BREAKPOINTS]
    if (maxWidth) {
      if (breakpoint === 'xl' || breakpoint === 'lg') {
        sizes.push(`${breakpoint}:${Math.ceil(maxWidth * desktopFraction)}px`)
      } else {
        sizes.push(`${breakpoint}:${Math.ceil(maxWidth * mobileFraction)}px`)
      }
    } else {
      if (breakpoint === 'xl' || breakpoint === 'lg') {
        sizes.push(`${breakpoint}:${desktopSize}vw`)
      } else {
        sizes.push(`${breakpoint}:${mobileSize}vw`)
      }
    }
  }

  return sizes.join(' ')
}

import { joinURL } from 'ufo'
import type { ImageModifiers } from '@nuxt/image'
import { defineProvider } from '@nuxt/image/runtime'

// Define custom modifiers for Contentstack provider
interface ContentstackModifiers extends ImageModifiers {
  // cspell:disable-next-line assetuid is a valid Contentstack parameter
  assetuid?: string
  versionuid?: string
}

// Create a simple URL builder that works without @nuxt/image dependencies
function buildParams(
  modifiers: Record<string, string | number>,
): URLSearchParams {
  const params = new URLSearchParams()

  // Map common @nuxt/image properties to Contentstack parameters
  const keyMapping: Record<string, string> = {
    width: 'width',
    height: 'height',
    quality: 'quality',
    format: 'format',
    auto: 'auto',
    blur: 'blur',
    brightness: 'brightness',
    contrast: 'contrast',
    saturation: 'saturation',
    dpr: 'dpr',
  }

  // Map fit values
  const fitMapping: Record<string, string> = {
    fill: 'crop',
    inside: 'crop',
    outside: 'crop',
    cover: 'bounds',
    contain: 'bounds',
  }

  Object.entries(modifiers).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const mappedKey = keyMapping[key] || key
      let mappedValue = value

      if (key === 'fit' && fitMapping[value]) {
        mappedValue = fitMapping[value]
        params.append('resize', mappedValue)
      } else {
        params.append(mappedKey, String(mappedValue))
      }
    }
  })

  return params
}

export default defineProvider<ContentstackModifiers>({
  getImage: (
    src: string,
    {
      modifiers = {},
      baseURL = '/',
    }: { modifiers?: Partial<ContentstackModifiers>; baseURL?: string } = {},
  ) => {
    // Handle asset-specific modifiers
    // cspell:disable-next-line assetuid is a valid Contentstack parameter
    const { assetuid, versionuid, ...imageModifiers } =
      modifiers as ContentstackModifiers

    // Add automatic optimization defaults (only if not already set)
    // Use Record<string, any> since we're building URL params that may include Contentstack-specific options
    const enhancedModifiers: Record<string, string | number> = {
      ...imageModifiers, // User modifiers first
      auto:
        (imageModifiers as Record<string, string | number>).auto ??
        'webp,compress',
      quality:
        (imageModifiers as Record<string, string | number>).quality ?? 80,
    }

    const operations = buildParams(enhancedModifiers)

    // Build URL - src is already the full Contentstack URL
    let url = new URL(src)

    // If src is not a full URL, prepend baseURL
    if (!src.startsWith('http://') && !src.startsWith('https://')) {
      // Ensure both parameters are strings before joining
      if (typeof baseURL === 'string' && typeof src === 'string') {
        url = new URL(joinURL(baseURL, src))
      }
    }

    for (const [key, value] of operations) {
      url.searchParams.set(key, value)
    }
    return {
      url: url.toString(),
    }
  },
})

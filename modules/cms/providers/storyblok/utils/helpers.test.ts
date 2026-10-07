import { describe, it, expect } from 'vitest'
import type { ISbStoryData } from '@storyblok/vue'
import type { PageComponent } from '../types'
import {
  resolveStoryblokSlug,
  generateStoryblokHreflangLinks,
  getAllSourceSlugs,
} from './helpers'

describe('resolveStoryblokSlug', () => {
  describe('Basic slug resolution', () => {
    it('should prepend locale code to path and normalize slashes', () => {
      expect(resolveStoryblokSlug('de', '/about')).toBe('de/about')
      expect(resolveStoryblokSlug('en', 'products')).toBe('en/products')
      expect(resolveStoryblokSlug('ch', '///contact///')).toBe('ch/contact')
      expect(resolveStoryblokSlug('de', '  /about  ')).toBe('de/about')
    })

    it('should handle nested paths', () => {
      expect(resolveStoryblokSlug('de', '/content/about')).toBe(
        'de/content/about',
      )
      expect(resolveStoryblokSlug('en', '/c/c-91825')).toBe('en/c/c-91825')
    })
  })

  describe('Homepage handling', () => {
    it('should map empty paths to homepage', () => {
      expect(resolveStoryblokSlug('de', '/')).toBe('de/homepage')
      expect(resolveStoryblokSlug('en', '')).toBe('en/homepage')
      expect(resolveStoryblokSlug('ch', '   ')).toBe('ch/homepage')
    })
  })

  describe('Locale prefix removal', () => {
    it('should remove matching locale prefix from path', () => {
      expect(resolveStoryblokSlug('de', '/de/about')).toBe('de/about')
      expect(resolveStoryblokSlug('en', '/en/content/privacy')).toBe(
        'en/content/privacy',
      )
    })

    it('should map locale-only path to homepage', () => {
      expect(resolveStoryblokSlug('de', '/de')).toBe('de/homepage')
      expect(resolveStoryblokSlug('en', '/en/')).toBe('en/homepage')
    })

    it('should preserve non-matching locale prefixes', () => {
      expect(resolveStoryblokSlug('de', '/en/about')).toBe('de/en/about')
      expect(resolveStoryblokSlug('de', '/demo/page')).toBe('de/demo/page')
    })

    it('should handle hyphenated locale codes', () => {
      expect(resolveStoryblokSlug('de-en', '/de-en/about')).toBe('de-en/about')
      expect(resolveStoryblokSlug('de-en', '/de-en')).toBe('de-en/homepage')
    })

    it('should escape special regex characters in locale codes', () => {
      expect(resolveStoryblokSlug('de.ch', '/de.ch/about')).toBe('de.ch/about')
      expect(resolveStoryblokSlug('d.e', '/de/about')).toBe('d.e/de/about')
    })
  })

  describe('Custom folder mapping', () => {
    it('should use custom folder names', () => {
      const mapping = { de: 'german', en: 'english' }
      expect(resolveStoryblokSlug('de', '/about', mapping)).toBe('german/about')
      expect(resolveStoryblokSlug('de', '/', mapping)).toBe('german/homepage')
    })

    it('should fall back to locale code when not in mapping', () => {
      const mapping = { de: 'german' }
      expect(resolveStoryblokSlug('en', '/about', mapping)).toBe('en/about')
    })

    it('should support shared content across shops', () => {
      const mapping = { de: 'de', at: 'de', ch: 'de' }
      expect(resolveStoryblokSlug('at', '/about', mapping)).toBe('de/about')
      expect(resolveStoryblokSlug('ch', '/about', mapping)).toBe('de/about')
    })

    it('should handle locale prefix removal with custom folder mapping', () => {
      const mapping = { de: 'german', en: 'english' }
      expect(resolveStoryblokSlug('de', '/de/about', mapping)).toBe(
        'german/about',
      )
      expect(resolveStoryblokSlug('de', '/de', mapping)).toBe('german/homepage')
      expect(resolveStoryblokSlug('en', '/en/content/page', mapping)).toBe(
        'english/content/page',
      )
    })

    it('should combine shared mapping with different routing scenarios', () => {
      const sharedMapping = { de: 'common', at: 'common', ch: 'common' }
      // Path-based with prefix
      expect(resolveStoryblokSlug('de', '/de/about', sharedMapping)).toBe(
        'common/about',
      )
      // Domain-based without prefix
      expect(resolveStoryblokSlug('at', '/about', sharedMapping)).toBe(
        'common/about',
      )
      // Homepage
      expect(resolveStoryblokSlug('ch', '/', sharedMapping)).toBe(
        'common/homepage',
      )
    })
  })

  describe('Real-world routing scenarios', () => {
    it('should handle path-based routing', () => {
      expect(resolveStoryblokSlug('de', '/de/')).toBe('de/homepage')
      expect(resolveStoryblokSlug('de', '/de/content/about')).toBe(
        'de/content/about',
      )
      expect(resolveStoryblokSlug('en', '/en/c/c-91825')).toBe('en/c/c-91825')
    })

    it('should handle domain-based routing', () => {
      expect(resolveStoryblokSlug('de', '/')).toBe('de/homepage')
      expect(resolveStoryblokSlug('de', '/content/about')).toBe(
        'de/content/about',
      )
      expect(resolveStoryblokSlug('en', '/c/c-56789')).toBe('en/c/c-56789')
    })

    it('should handle path-except-default routing', () => {
      // Default shop without prefix
      expect(resolveStoryblokSlug('de', '/content/about')).toBe(
        'de/content/about',
      )
      // Non-default shops with prefix
      expect(resolveStoryblokSlug('en', '/en/content/about')).toBe(
        'en/content/about',
      )
    })

    it('should handle multiple German-speaking shops separately', () => {
      expect(resolveStoryblokSlug('de', '/de/about')).toBe('de/about')
      expect(resolveStoryblokSlug('at', '/at/about')).toBe('at/about')
      expect(resolveStoryblokSlug('ch', '/ch/about')).toBe('ch/about')
    })
  })
})

describe('generateStoryblokHreflangLinks', () => {
  describe('Basic hreflang generation', () => {
    it('should generate alternate links for each locale', () => {
      const links = [
        { locale: 'en', href: 'https://example.com/en/about', path: 'en' },
        { locale: 'de', href: 'https://example.com/de/about', path: 'de' },
      ]

      const result = generateStoryblokHreflangLinks(links, 'en')

      expect(result).toEqual([
        {
          rel: 'alternate',
          hreflang: 'en',
          href: 'https://example.com/en/about',
        },
        {
          rel: 'alternate',
          hreflang: 'x-default',
          href: 'https://example.com/en/about',
        },
        {
          rel: 'alternate',
          hreflang: 'de',
          href: 'https://example.com/de/about',
        },
      ])
    })

    it('should add x-default link for the default locale', () => {
      const links = [
        { locale: 'de', href: 'https://example.com/de/page', path: 'de' },
      ]

      const result = generateStoryblokHreflangLinks(links, 'de')

      expect(result).toContainEqual({
        rel: 'alternate',
        hreflang: 'x-default',
        href: 'https://example.com/de/page',
      })
    })

    it('should not add x-default link for non-default locales', () => {
      const links = [
        { locale: 'fr', href: 'https://example.com/fr/page', path: 'fr' },
      ]

      const result = generateStoryblokHreflangLinks(links, 'en')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        rel: 'alternate',
        hreflang: 'fr',
        href: 'https://example.com/fr/page',
      })
    })
  })

  describe('Edge cases', () => {
    it('should return empty array for null or undefined input', () => {
      expect(
        generateStoryblokHreflangLinks(null as unknown as [], 'en'),
      ).toEqual([])
      expect(
        generateStoryblokHreflangLinks(undefined as unknown as [], 'en'),
      ).toEqual([])
    })

    it('should return empty array for empty links array', () => {
      expect(generateStoryblokHreflangLinks([], 'en')).toEqual([])
    })

    it('should handle single locale', () => {
      const links = [
        { locale: 'en', href: 'https://example.com/en/page', path: 'en' },
      ]

      const result = generateStoryblokHreflangLinks(links, 'en')

      expect(result).toHaveLength(2)
      expect(result).toContainEqual({
        rel: 'alternate',
        hreflang: 'en',
        href: 'https://example.com/en/page',
      })
      expect(result).toContainEqual({
        rel: 'alternate',
        hreflang: 'x-default',
        href: 'https://example.com/en/page',
      })
    })
  })

  describe('Multiple locales', () => {
    it('should handle multiple locales with different paths', () => {
      const links = [
        {
          locale: 'en-US',
          href: 'https://example.com/en-us/about',
          path: 'en-US',
        },
        { locale: 'en-GB', href: 'https://example.co.uk/about', path: 'en-GB' },
        { locale: 'de-DE', href: 'https://example.de/about', path: 'de-DE' },
        { locale: 'fr-FR', href: 'https://example.fr/about', path: 'fr-FR' },
      ]

      const result = generateStoryblokHreflangLinks(links, 'en-US')

      expect(result).toHaveLength(5) // 4 locales + 1 x-default
      expect(
        result.filter((link) => link.hreflang === 'x-default'),
      ).toHaveLength(1)
    })

    it('should correctly identify default locale by path', () => {
      const links = [
        { locale: 'en', href: 'https://example.com/en/page', path: 'en' },
        { locale: 'de', href: 'https://example.com/de/page', path: 'de' },
        { locale: 'fr', href: 'https://example.com/fr/page', path: 'fr' },
      ]

      const result = generateStoryblokHreflangLinks(links, 'de')

      const xDefaultLinks = result.filter(
        (link) => link.hreflang === 'x-default',
      )
      expect(xDefaultLinks).toHaveLength(1)
      expect(xDefaultLinks[0]?.href).toBe('https://example.com/de/page')
    })
  })
})

describe('getAllSourceSlugs', () => {
  const createMockStory = (
    fullSlug: string,
    alternates?: { full_slug: string }[],
  ): ISbStoryData<PageComponent> => {
    return {
      full_slug: fullSlug,
      alternates: alternates,
    } as ISbStoryData<PageComponent>
  }

  describe('Basic functionality', () => {
    it('should extract path and slug from story full_slug', () => {
      const story = createMockStory('de/about')

      const result = getAllSourceSlugs(story)

      expect(result).toEqual([{ path: 'de', slug: 'about' }])
    })

    it('should handle nested slugs', () => {
      const story = createMockStory('de/content/about')

      const result = getAllSourceSlugs(story)

      expect(result).toEqual([{ path: 'de', slug: 'content/about' }])
    })

    it('should handle homepage slug', () => {
      const story = createMockStory('de/homepage')

      const result = getAllSourceSlugs(story)

      expect(result).toEqual([{ path: 'de', slug: 'homepage' }])
    })

    it('should handle slug with only path', () => {
      const story = createMockStory('de')

      const result = getAllSourceSlugs(story)

      expect(result).toEqual([{ path: 'de', slug: '' }])
    })
  })

  describe('Alternates handling', () => {
    it('should include alternates in source slugs', () => {
      const story = createMockStory('de/about', [
        { full_slug: 'en/about' },
        { full_slug: 'fr/about' },
      ])

      const result = getAllSourceSlugs(story)

      expect(result).toEqual([
        { path: 'de', slug: 'about' },
        { path: 'en', slug: 'about' },
        { path: 'fr', slug: 'about' },
      ])
    })

    it('should handle alternates with different slugs', () => {
      const story = createMockStory('de/about', [{ full_slug: 'en/contact' }])

      const result = getAllSourceSlugs(story)

      expect(result).toEqual([
        { path: 'de', slug: 'about' },
        { path: 'en', slug: 'contact' },
      ])
    })

    it('should handle empty alternates array', () => {
      const story = createMockStory('de/about', [])

      const result = getAllSourceSlugs(story)

      expect(result).toEqual([{ path: 'de', slug: 'about' }])
    })

    it('should handle undefined alternates', () => {
      const story = createMockStory('de/about', undefined)

      const result = getAllSourceSlugs(story)

      expect(result).toEqual([{ path: 'de', slug: 'about' }])
    })
  })

  describe('Folder mapping integration', () => {
    it('should extend source slugs with folder mapping keys', () => {
      const story = createMockStory('de/about')
      const folderMapping = {
        de: 'de',
        at: 'de',
        ch: 'de',
      }

      const result = getAllSourceSlugs(story, folderMapping)

      expect(result).toEqual([
        { path: 'at', slug: 'about' },
        { path: 'ch', slug: 'about' },
        { path: 'de', slug: 'about' },
      ])
    })

    it('should handle multiple source slugs with folder mapping', () => {
      const story = createMockStory('de/about', [{ full_slug: 'en/contact' }])
      const folderMapping = {
        de: 'de',
        at: 'de',
        ch: 'de',
        en: 'en',
        'en-US': 'en',
      }

      const result = getAllSourceSlugs(story, folderMapping)

      expect(result).toEqual([
        { path: 'at', slug: 'about' },
        { path: 'ch', slug: 'about' },
        { path: 'de', slug: 'about' },
        { path: 'en-US', slug: 'contact' },
        { path: 'en', slug: 'contact' },
      ])
    })

    it('should not add mapped keys when path has no mapping', () => {
      const story = createMockStory('fr/about')
      const folderMapping = {
        de: 'de',
        at: 'de',
      }

      const result = getAllSourceSlugs(story, folderMapping)

      expect(result).toEqual([{ path: 'fr', slug: 'about' }])
    })

    it('should handle folder mapping with no matching keys', () => {
      const story = createMockStory('de/about')
      const folderMapping = {
        en: 'en',
        fr: 'fr',
      }

      const result = getAllSourceSlugs(story, folderMapping)

      expect(result).toEqual([{ path: 'de', slug: 'about' }])
    })
  })
})

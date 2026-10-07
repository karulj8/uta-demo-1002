import { describe, it, expect } from 'vitest'
import { generateContentfulHreflangLinks } from './helpers'

describe('generateContentfulHreflangLinks', () => {
  describe('Basic hreflang generation', () => {
    it('should generate alternate links for each locale', () => {
      const links = [
        { locale: 'en', href: 'https://example.com/en/about', path: 'en' },
        {
          locale: 'de',
          href: 'https://example.com/de/about',
          path: 'de',
        },
      ]

      const result = generateContentfulHreflangLinks(links, 'en')

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

      const result = generateContentfulHreflangLinks(links, 'de')

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

      const result = generateContentfulHreflangLinks(links, 'en')

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
        generateContentfulHreflangLinks(null as unknown as [], 'en'),
      ).toEqual([])
      expect(
        generateContentfulHreflangLinks(undefined as unknown as [], 'en'),
      ).toEqual([])
    })

    it('should return empty array for empty links array', () => {
      expect(generateContentfulHreflangLinks([], 'en')).toEqual([])
    })

    it('should handle single locale marked as default', () => {
      const links = [
        { locale: 'en', href: 'https://example.com/en/page', path: 'en' },
      ]

      const result = generateContentfulHreflangLinks(links, 'en')

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

    it('should handle single locale not marked as default', () => {
      const links = [
        { locale: 'en', href: 'https://example.com/en/page', path: 'en' },
      ]

      const result = generateContentfulHreflangLinks(links, 'de')

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        rel: 'alternate',
        hreflang: 'en',
        href: 'https://example.com/en/page',
      })
    })
  })

  describe('Multiple locales', () => {
    it('should handle multiple locales with one default', () => {
      const links = [
        {
          locale: 'en-US',
          href: 'https://example.com/en-us/about',
          path: 'en',
        },
        { locale: 'de-DE', href: 'https://example.de/about', path: 'de' },
        { locale: 'fr-FR', href: 'https://example.fr/about', path: 'fr' },
      ]

      const result = generateContentfulHreflangLinks(links, 'en')

      expect(result).toHaveLength(4) // 3 locales + 1 x-default
      expect(
        result.filter((link) => link.hreflang === 'x-default'),
      ).toHaveLength(1)
    })

    it('should correctly identify default locale by isDefault flag', () => {
      const links = [
        { locale: 'en', href: 'https://example.com/en/page', path: 'en' },
        { locale: 'de', href: 'https://example.com/de/page', path: 'de' },
        { locale: 'fr', href: 'https://example.com/fr/page', path: 'fr' },
      ]

      const result = generateContentfulHreflangLinks(links, 'de')

      const xDefaultLinks = result.filter(
        (link) => link.hreflang === 'x-default',
      )
      expect(xDefaultLinks).toHaveLength(1)
      expect(xDefaultLinks[0]?.href).toBe('https://example.com/de/page')
    })
  })
})

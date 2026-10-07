import { describe, expect, it } from 'vitest'
import { generateContentstackHreflangLinks } from './helper'

describe('generateContentstackHreflangLinks', () => {
  it('should return an empty array when contentfulLinks is undefined', () => {
    const result = generateContentstackHreflangLinks(undefined, 'en')
    expect(result).toEqual([])
  })

  it('should return an empty array when contentfulLinks is an empty array', () => {
    const result = generateContentstackHreflangLinks([], 'en')
    expect(result).toEqual([])
  })

  it('should generate correct hreflang links for a single contentfulLinks element that is NOT the defaultLocale', () => {
    const contentfulLinks = [
      { locale: 'de', href: 'https://domain.com/de', path: 'de' },
    ]
    const defaultLocale = 'en'
    const result = generateContentstackHreflangLinks(
      contentfulLinks,
      defaultLocale,
    )
    expect(result).toEqual([
      {
        rel: 'alternate',
        hreflang: 'de',
        href: 'https://domain.com/de',
      },
    ])
  })

  it('should generate correct hreflang links for a single contentfulLinks element that IS the defaultLocale', () => {
    const contentfulLinks = [
      { locale: 'en', href: 'https://domain.com/', path: 'en' },
    ]
    const defaultLocale = 'en'
    const result = generateContentstackHreflangLinks(
      contentfulLinks,
      defaultLocale,
    )
    expect(result).toEqual([
      {
        rel: 'alternate',
        hreflang: 'en',
        href: 'https://domain.com/',
      },
      {
        rel: 'alternate',
        hreflang: 'x-default',
        href: 'https://domain.com/',
      },
    ])
  })
})

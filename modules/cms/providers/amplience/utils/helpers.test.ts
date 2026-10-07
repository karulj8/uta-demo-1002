import { describe, expect, it } from 'vitest'
import {
  buildAmplienceClientConfig,
  getVseFromRoute,
  isAmplienceCategoryRoutePath,
  isInEditorMode,
  parseCategoryIdFromAmplienceDeliveryKey,
  resolveAmpliencePlpPreviewPath,
} from './helpers'

describe('Amplience helpers', () => {
  it('detects editor mode from vse query param', () => {
    expect(
      isInEditorMode({ query: { vse: 'preview.example.com' } } as never),
    ).toBe(true)
  })

  it('detects VSE from route query', () => {
    expect(
      getVseFromRoute({ query: { vse: 'preview.example.com' } } as never),
    ).toBe('preview.example.com')
  })

  it('builds a published client config without a VSE domain', () => {
    expect(
      buildAmplienceClientConfig(
        { hubName: 'test-hub', allowDrafts: true },
        { query: {} } as never,
      ),
    ).toEqual({ hubName: 'test-hub' })
  })

  it('builds a staging client config when preview is active', () => {
    expect(
      buildAmplienceClientConfig(
        { hubName: 'test-hub', allowDrafts: true },
        { query: { vse: 'https://preview.example.com' } } as never,
      ),
    ).toEqual({
      hubName: 'test-hub',
      stagingEnvironment: 'preview.example.com',
    })
  })

  it('ignores the VSE domain when drafts are disabled', () => {
    expect(
      buildAmplienceClientConfig(
        { hubName: 'test-hub', allowDrafts: false },
        { query: { vse: 'preview.example.com' } } as never,
      ),
    ).toEqual({ hubName: 'test-hub' })
  })

  it('parses a category ID from a locale-prefixed PLP delivery key', () => {
    expect(parseCategoryIdFromAmplienceDeliveryKey('en-US/c/c-91825')).toBe(
      91825,
    )
  })

  it('parses a category ID from a relative PLP slug', () => {
    expect(parseCategoryIdFromAmplienceDeliveryKey('c/c-100')).toBe(100)
  })

  it('returns undefined for non-PLP delivery keys', () => {
    expect(
      parseCategoryIdFromAmplienceDeliveryKey('en-US/content/about'),
    ).toBeUndefined()
    expect(parseCategoryIdFromAmplienceDeliveryKey('en-US/homepage')).toBeUndefined()
  })

  it('detects category route paths under /c/', () => {
    expect(isAmplienceCategoryRoutePath('/c/cms-preview-0')).toBe(true)
    expect(isAmplienceCategoryRoutePath('/de/c/women-123')).toBe(true)
    expect(isAmplienceCategoryRoutePath('/content/about')).toBe(false)
  })

  it('rewrites a PLP preview path with the parsed category ID', () => {
    expect(resolveAmpliencePlpPreviewPath('/c/cms-preview-0', 91825)).toBe(
      '/c/cms-preview-91825',
    )
    expect(
      resolveAmpliencePlpPreviewPath('/de/c/cms-preview-0', 91825),
    ).toBe('/de/c/cms-preview-91825')
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { isInEditorMode } from './utils'
import type { RouteLocationNormalizedLoadedGeneric } from '#vue-router'

const { isClientSideMock, useRequestHeaderMock } = vi.hoisted(() => {
  return {
    useRequestHeaderMock: vi.fn(),
    isClientSideMock: vi.fn(),
  }
})

describe('isInEditorMode', () => {
  vi.mock('./helper', async () => ({
    isClientSide: isClientSideMock,
  }))

  describe('on the client side', () => {
    beforeEach(() => {
      vi.resetAllMocks()
      isClientSideMock.mockReturnValue(true)
    })

    it('should return true if the referer is the contentstack editor', () => {
      vi.stubGlobal('document', {
        referrer: 'https://app.contentstack.com/',
      } as unknown as Document)
      expect(
        isInEditorMode({
          query: {},
        } as unknown as RouteLocationNormalizedLoadedGeneric),
      ).toBe(true)
    })
    it('should return false if the referer is not the contentstack editor', () => {
      vi.stubGlobal('document', {
        referrer: 'https://google.com/',
      } as unknown as Document)
      expect(
        isInEditorMode({
          query: {},
        } as unknown as RouteLocationNormalizedLoadedGeneric),
      ).toBe(false)
    })
    it('should return true if the live_preview query parameter is present', () => {
      expect(
        isInEditorMode({
          query: { live_preview: 'true' },
        } as unknown as RouteLocationNormalizedLoadedGeneric),
      ).toBe(true)
    })
  })

  describe('on the server side', () => {
    beforeEach(() => {
      vi.resetAllMocks()
      isClientSideMock.mockReturnValue(false)
    })

    mockNuxtImport('useRequestHeader', () => useRequestHeaderMock)
    it('should return true if the referer is the contentstack editor', () => {
      useRequestHeaderMock.mockReturnValueOnce('https://app.contentstack.com/')
      expect(
        isInEditorMode({
          query: {},
        } as unknown as RouteLocationNormalizedLoadedGeneric),
      ).toBe(true)
    })

    it('should return false if the referer is not the contentstack editor', () => {
      useRequestHeaderMock.mockReturnValueOnce('https://google.com/')
      expect(
        isInEditorMode({
          query: {},
        } as unknown as RouteLocationNormalizedLoadedGeneric),
      ).toBe(false)
    })

    it('should return true if the live_preview query parameter is present', () => {
      vi.mock('#imports', () => ({
        useRequestHeader: vi.fn().mockReturnValue('https://google.com/'),
      }))
      expect(
        isInEditorMode({
          query: { live_preview: 'true' },
        } as unknown as RouteLocationNormalizedLoadedGeneric),
      ).toBe(true)
    })
  })
})

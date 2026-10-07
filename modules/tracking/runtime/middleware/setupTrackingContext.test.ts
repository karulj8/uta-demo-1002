import { describe, it, expect, vi, beforeEach } from 'vitest'
import { routeFactory } from '@scayle/storefront-nuxt/test/factories'
import type { PageType } from '../types/tracking'
import setupTrackingContextMiddleware from './setupTrackingContext.global'

const mocks = vi.hoisted(() => {
  return {
    setInitialPage: vi.fn(),
    setPreviousPageContext: vi.fn(),
    setCurrentPageContext: vi.fn(),
  }
})

vi.mock('#app/composables/router', () => ({
  defineNuxtRouteMiddleware: vi.fn((fn) => fn),
}))

vi.mock('../composables/useTrackingContextState', () => ({
  useTrackingContextState: vi.fn(() => ({
    setInitialPage: mocks.setInitialPage,
    setPreviousPageContext: mocks.setPreviousPageContext,
    setCurrentPageContext: mocks.setCurrentPageContext,
  })),
}))

describe('setupTrackingContext middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('window', {
      location: {
        href: 'https://example.com/de',
      },
    })
  })

  describe('initial page load', () => {
    it('should set landing page when from.path equals to.path', () => {
      const to = routeFactory.build({ path: '/p/123' })
      const from = routeFactory.build({ path: '/p/123' })

      setupTrackingContextMiddleware(to, from)

      expect(mocks.setInitialPage).toHaveBeenCalledWith(
        'https://example.com/de',
      )
      expect(mocks.setPreviousPageContext).not.toHaveBeenCalled()
    })

    it('should use window.location.href for landing page', () => {
      vi.stubGlobal('window', {
        location: {
          href: 'https://example.com/de/products?utm_source=google',
        },
      })

      const to = routeFactory.build({ path: '/products' })
      const from = routeFactory.build({ path: '/products' })

      setupTrackingContextMiddleware(to, from)

      expect(mocks.setInitialPage).toHaveBeenCalledWith(
        'https://example.com/de/products?utm_source=google',
      )
    })
  })

  describe('navigation between pages', () => {
    it('should set previous page context with path and page type', () => {
      const to = routeFactory.build({
        path: '/c/category-123',
        meta: { pageType: 'product_listing' },
      })
      const from = routeFactory.build({
        path: '/p/123',
        meta: { pageType: 'product_detail' },
      })

      setupTrackingContextMiddleware(to, from)

      expect(mocks.setPreviousPageContext).toHaveBeenCalledWith(
        '/p/123',
        'product_detail',
      )
      expect(mocks.setInitialPage).not.toHaveBeenCalled()
    })

    it('should handle different page types', () => {
      const pageTypes: PageType[] = [
        'product_detail',
        'product_listing',
        'basket',
        'checkout',
        'account',
        'homepage',
      ]

      for (const pageType of pageTypes) {
        vi.clearAllMocks()

        const to = routeFactory.build({
          path: '/next',
          meta: { pageType: 'homepage' },
        })
        const from = routeFactory.build({
          path: `/from-${pageType}`,
          meta: { pageType },
        })

        setupTrackingContextMiddleware(to, from)

        expect(mocks.setPreviousPageContext).toHaveBeenCalledWith(
          `/from-${pageType}`,
          pageType,
        )
      }
    })

    it('should handle undefined page type in meta', () => {
      const to = routeFactory.build({
        path: '/next',
        meta: {},
      })
      const from = routeFactory.build({
        path: '/previous',
        meta: {},
      })

      setupTrackingContextMiddleware(to, from)

      expect(mocks.setPreviousPageContext).toHaveBeenCalledWith(
        '/previous',
        undefined,
      )
    })

    it('should handle empty paths', () => {
      const to = routeFactory.build({
        path: '/',
        meta: { pageType: 'homepage' },
      })
      const from = routeFactory.build({
        path: '/',
        meta: { pageType: 'homepage' },
      })

      setupTrackingContextMiddleware(to, from)

      expect(mocks.setInitialPage).toHaveBeenCalled()
      expect(mocks.setPreviousPageContext).not.toHaveBeenCalled()
    })

    it('should not set landing page when navigating to different path', () => {
      const to = routeFactory.build({
        path: '/c/category',
        meta: { pageType: 'product_listing' },
      })
      const from = routeFactory.build({
        path: '/p/product',
        meta: { pageType: 'product_detail' },
      })

      setupTrackingContextMiddleware(to, from)

      expect(mocks.setInitialPage).not.toHaveBeenCalled()
      expect(mocks.setPreviousPageContext).toHaveBeenCalledWith(
        '/p/product',
        'product_detail',
      )
    })
  })
})

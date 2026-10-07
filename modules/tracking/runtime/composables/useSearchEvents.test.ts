import { describe, it, expect, vi, beforeEach } from 'vitest'
import type {
  Category,
  CategoryFilter,
  NavigationItemCategory,
  NavigationItemPage,
  SearchEntity,
} from '@scayle/storefront-nuxt'
import { productFactory } from '@scayle/storefront-nuxt/test/factories'
import { useSearchEvents } from './useSearchEvents'

const mocks = vi.hoisted(() => {
  return {
    push: vi.fn(),
    getProductDetailRoute: vi.fn((id: number) => `/p/product-${id}`),
    buildCategorySuggestionRoute: vi.fn(() => ({ path: '/c/category-123' })),
    buildNavigationTreeItemRoute: vi.fn(() => ({
      route: '/page-123',
    })),
    getSearchRoute: vi.fn((term: string) => `/search?q=${term}`),
  }
})

vi.mock('./useTracking', () => ({
  useTracking: vi.fn(() => ({
    push: mocks.push,
  })),
}))

vi.mock('~/composables', () => ({
  useRouteHelpers: vi.fn(() => ({
    getProductDetailRoute: mocks.getProductDetailRoute,
    buildCategorySuggestionRoute: mocks.buildCategorySuggestionRoute,
    buildNavigationTreeItemRoute: mocks.buildNavigationTreeItemRoute,
    getSearchRoute: mocks.getSearchRoute,
  })),
}))

vi.mock('@scayle/storefront-nuxt/composables', () => ({
  useLog: vi.fn(() => console),
}))

describe('useSearchEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSearchDestination', () => {
    it('should return search route for show_all suggestion', () => {
      const { getSearchDestination } = useSearchEvents()

      const result = getSearchDestination('test query', 'show_all')

      expect(result).toBe('/search?q=test query')
      expect(mocks.getSearchRoute).toHaveBeenCalledWith('test query')
    })

    it('should return product detail route for product suggestion', () => {
      const { getSearchDestination } = useSearchEvents()

      const suggestion: SearchEntity = {
        type: 'product',
        productSuggestion: {
          product: productFactory.build({
            id: 123,
            attributes: {},
            isActive: true,
            isSoldOut: false,
            isNew: false,
            createdAt: '',
            updatedAt: '',
            images: [],
            siblings: [],
          }),
        },
      }

      const result = getSearchDestination('test', suggestion)

      expect(result).toBe('/p/product-123')
      expect(mocks.getProductDetailRoute).toHaveBeenCalledWith(123)
    })

    it('should return category route for category suggestion', () => {
      const { getSearchDestination } = useSearchEvents()

      const suggestion: SearchEntity = {
        type: 'category',
        categorySuggestion: {
          category: {
            id: 123,
            path: '/category',
          } as Category,
          filters: [] as CategoryFilter[],
        },
      }

      const result = getSearchDestination('test', suggestion)

      expect(result).toBe('/c/category-123')
      expect(mocks.buildCategorySuggestionRoute).toHaveBeenCalledWith(
        suggestion,
      )
    })

    it('should return navigation item route for navigation item suggestion', () => {
      const { getSearchDestination } = useSearchEvents()

      const suggestion: SearchEntity = {
        type: 'navigationItem',
        navigationItemSuggestion: {
          navigationItem: {
            id: 123,
            type: 'category',
          } as NavigationItemCategory,
        },
      }

      const result = getSearchDestination('test', suggestion)

      expect(result).toBe('/page-123')
      expect(mocks.buildNavigationTreeItemRoute).toHaveBeenCalledWith(
        suggestion.navigationItemSuggestion.navigationItem,
      )
    })

    it('should return undefined for suggestion without type', () => {
      const { getSearchDestination } = useSearchEvents()

      const suggestion = {
        type: undefined,
      } as unknown as SearchEntity

      const result = getSearchDestination('test', suggestion)

      expect(result).toBeUndefined()
    })
  })

  describe('trackSearch', () => {
    it('should track search event with show_all suggestion', () => {
      const { trackSearch } = useSearchEvents()

      trackSearch({
        query: 'test query',
        suggestion: 'show_all',
      })

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'search',
        search_term: 'test query',
        search_action: 'search_term',
        search_destination: '/search?q=test query',
      })
    })

    it('should track search event with product suggestion', () => {
      const { trackSearch } = useSearchEvents()

      const suggestion: SearchEntity = {
        type: 'product',
        productSuggestion: {
          product: productFactory.build({
            id: 789,
            attributes: {},
            isActive: true,
            isSoldOut: false,
            isNew: false,
            createdAt: '',
            updatedAt: '',
            images: [],
            siblings: [],
          }),
        },
      }

      trackSearch({
        query: 'product search',
        suggestion,
      })

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'search',
        search_term: 'product search',
        search_action: 'suggested_product',
        search_destination: '/p/product-789',
      })
    })

    it('should track search event with category suggestion', () => {
      const { trackSearch } = useSearchEvents()

      const suggestion: SearchEntity = {
        type: 'category',
        categorySuggestion: {
          category: {
            id: 999,
            path: '/category',
          } as Category,
          filters: [] as CategoryFilter[],
        },
      }

      trackSearch({
        query: 'category search',
        suggestion,
      })

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'search',
        search_term: 'category search',
        search_action: 'suggested_category',
        search_destination: '/c/category-123',
      })
    })

    it('should track search event with navigation item suggestion', () => {
      const { trackSearch } = useSearchEvents()

      const suggestion: SearchEntity = {
        type: 'navigationItem',
        navigationItemSuggestion: {
          navigationItem: {
            id: 111,
            type: 'page',
            page: '/nav-page',
          } as NavigationItemPage,
        },
      }

      trackSearch({
        query: 'nav search',
        suggestion,
      })

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'search',
        search_term: 'nav search',
        search_action: 'suggested_page',
        search_destination: '/page-123',
      })
    })

    it('should track search event with undefined destination', () => {
      const { trackSearch } = useSearchEvents()

      const suggestion = {
        type: undefined,
      } as unknown as SearchEntity

      trackSearch({
        query: 'undefined search',
        suggestion,
      })

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'search',
        search_term: 'undefined search',
        search_action: 'search_term',
        search_destination: undefined,
      })
    })
  })
})

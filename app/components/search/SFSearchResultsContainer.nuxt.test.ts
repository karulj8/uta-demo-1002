import { renderSuspended } from '@nuxt/test-utils/runtime'
import { expect, it, vi } from 'vitest'
import type {
  CategorySearchSuggestion,
  NavigationItemSuggestion,
  ProductSearchSuggestion,
} from '@scayle/storefront-nuxt'
import { fireEvent } from '@testing-library/vue'
import {
  categorySearchSuggestionFactory,
  navigationItemSuggestionFactory,
  productSearchSuggestionFactory,
} from '@scayle/storefront-nuxt/test/factories'
import SFSearchResultsContainer from './SFSearchResultsContainer.vue'

vi.mock('#storefront/composables', async () => {
  const actual = await vi.importActual('#storefront/composables')
  return {
    ...actual,
    useFormatHelpers: () => ({
      formatCurrency: (value: number) => `${value / 100}€`,
      formatPercentage: vi
        .fn()
        .mockImplementation((value: number) => `${value * 100}%`),
    }),
  }
})

const categorySuggestion: CategorySearchSuggestion[] = [
  categorySearchSuggestionFactory.build(),
]
const productSuggestion: ProductSearchSuggestion[] = [
  productSearchSuggestionFactory.build(),
]
const navigationItemSuggestion: NavigationItemSuggestion[] = [
  navigationItemSuggestionFactory.build(),
]

const getSearchResultsContainerComponent = (
  searchQuery: string,
  showSuggestionsLoader: boolean,
  categories: CategorySearchSuggestion[] = [],
  products: ProductSearchSuggestion[] = [],
  navigationItems: NavigationItemSuggestion[] = [],
) => {
  return renderSuspended(SFSearchResultsContainer, {
    props: {
      searchQuery,
      products,
      categories,
      navigationItems,
      showSuggestionsLoader,
    },
  })
}

it('should render skeleton loader', async () => {
  const { getByTestId } = await getSearchResultsContainerComponent('Test', true)
  expect(getByTestId('skeleton')).toBeInTheDocument()
})

it('should render "no results" message', async () => {
  const { getByTestId } = await getSearchResultsContainerComponent(
    'Test',
    false,
  )
  expect(getByTestId('no-result')).toBeInTheDocument()
})

it('should render suggestions', async () => {
  const { getAllByRole } = await getSearchResultsContainerComponent(
    'Test',
    false,
    categorySuggestion,
    productSuggestion,
    navigationItemSuggestion,
  )
  expect(getAllByRole('option')).toHaveLength(4)
})

it('should emit "clickResult" event when suggestion was clicked', async () => {
  const { getAllByRole, emitted } = await getSearchResultsContainerComponent(
    'Test',
    false,
    categorySuggestion,
    productSuggestion,
    navigationItemSuggestion,
  )
  // search suggestions
  const groups = getAllByRole('group')
  for (const group of groups) {
    const options = Array.from(group.querySelectorAll('[role="option"] > a'))
    await Promise.all(options.map((option) => fireEvent.click(option)))
  }
  // Show all link
  const options = getAllByRole('option')
  await Promise.all(options.map((option) => fireEvent.click(option)))
  expect(emitted()['clickResult']).toHaveLength(4)
})

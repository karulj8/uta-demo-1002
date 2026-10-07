import { renderSuspended } from '@nuxt/test-utils/runtime'
import { expect, it, vi } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import {
  categorySearchSuggestionFactory,
  navigationItemSuggestionFactory,
  productSearchSuggestionFactory,
} from '@scayle/storefront-nuxt/test/factories'
import SFSearchResults from './SFSearchResults.vue'

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

const getSearchResultsComponent = () => {
  return renderSuspended(SFSearchResults, {
    props: {
      categories: [categorySearchSuggestionFactory.build()],
      products: [productSearchSuggestionFactory.build()],
      navigationItems: [navigationItemSuggestionFactory.build()],
      searchTerm: 'Search',
    },
  })
}

it('should render all suggestions', async () => {
  const { getByText, getAllByRole, getByRole } =
    await getSearchResultsComponent()

  expect(getByRole('listbox')).toBeInTheDocument()
  expect(getAllByRole('option')).toHaveLength(4)
  expect(getByText('Categories')).toBeInTheDocument()
  expect(getByText('Products')).toBeInTheDocument()
  expect(getByText('Pages')).toBeInTheDocument()
  expect(
    getByRole('option', { name: 'See all Search results' }),
  ).toBeInTheDocument()
})

it('should emit "click" result event when option was clicked', async () => {
  const { emitted, getAllByRole } = await getSearchResultsComponent()
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

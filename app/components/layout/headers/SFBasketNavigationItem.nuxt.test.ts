import { ref } from 'vue'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { expect, it, vi } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import { basketItemFactory } from '@scayle/storefront-nuxt/test/factories'
import BasketNavigationItem from './SFBasketNavigationItem.vue'

const { useBasket } = vi.hoisted(() => ({
  useBasket: vi.fn(),
}))

vi.mock('#storefront/composables', async () => {
  const actual = await vi.importActual('#storefront/composables')
  return {
    ...actual,
    useBasket,
    useCurrentShop: () => ref({ locale: new Intl.Locale('de-DE') }),
    useFormatHelpers: () => ({
      formatCurrency: (value: number) => `${value / 100}€`,
      formatPercentage: vi
        .fn()
        .mockImplementation((value: number) => `${value * 100}%`),
    }),
  }
})

it('should render SFBasketNavigationItem with empty basket', async () => {
  useBasket.mockReturnValue({
    count: ref(0),
    status: ref('success'),
    items: ref([]),
    isEmpty: ref(true),
  })
  const { getByRole, getByText, getByTestId } =
    await renderSuspended(BasketNavigationItem)
  await fireEvent.mouseEnter(getByTestId('popoverContainer'))

  const basketLink = getByRole('link', { name: 'Basket' })
  expect(basketLink).toBeInTheDocument()
  expect(basketLink).toHaveAttribute('href', '/en/basket')
  expect(getByText('You have no products in your basket.')).toBeInTheDocument()
})

const getBasketItems = (itemCount: number) => {
  return Array(itemCount).fill(basketItemFactory.build())
}

it.each([1, 2])(
  'should render basket SFBasketNavigationItem with %i basket item',
  async (itemCount) => {
    useBasket.mockReturnValue({
      count: ref(itemCount),
      status: ref('success'),
      items: ref(getBasketItems(itemCount)),
      isEmpty: ref(false),
      then: vi.fn(),
    })
    const { getByRole, getByTestId, queryByText } =
      await renderSuspended(BasketNavigationItem)
    await fireEvent.mouseEnter(getByTestId('popoverContainer'))

    const basketLink = getByTestId('basket-link')

    expect(basketLink).toBeInTheDocument()
    expect(basketLink).toHaveAttribute('href', '/en/basket')
    expect(basketLink).toHaveTextContent(`${itemCount}`)
    expect(
      queryByText('You have no products in your basket.'),
    ).not.toBeInTheDocument()

    expect(
      getByRole('list', { name: 'Available products' }),
    ).toBeInTheDocument()

    const basketButton = getByRole('link', { name: 'Go to Basket' })
    expect(basketButton).toBeInTheDocument()
    expect(basketButton).toHaveAttribute('href', '/en/basket')

    const checkoutButton = getByRole('link', { name: 'Go to Checkout' })
    expect(checkoutButton).toBeInTheDocument()
    expect(checkoutButton).toHaveAttribute('href', '/en/checkout')
  },
)

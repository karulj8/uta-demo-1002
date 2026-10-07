import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { categoryFactory } from '@scayle/storefront-nuxt/test/factories'
import SFCategoryBreadcrumbs from './SFCategoryBreadcrumbs.vue'

// The breadcrumb trail comes from the category tree and is covered by
// `useBreadcrumbs.test.ts`. Stubbing it keeps these tests on the badge.
vi.mock('~/composables', () => ({
  useBreadcrumbs: () => ({
    getBreadcrumbsFromCategory: () => [],
  }),
}))

const category = categoryFactory.build({ name: 'Shirts' })

const renderBreadcrumbs = (
  props: { productsCount?: number; loading?: boolean } = {},
) => renderSuspended(SFCategoryBreadcrumbs, { props: { category, ...props } })

describe('SFCategoryBreadcrumbs.vue', () => {
  it('renders the category name', async () => {
    const { getByTestId } = await renderBreadcrumbs({ productsCount: 42 })

    expect(getByTestId('active-category-breadcrumb')).toHaveTextContent(
      'Shirts',
    )
  })

  describe('product count badge', () => {
    it('shows the count once the products request settled', async () => {
      const { getByTestId } = await renderBreadcrumbs({
        productsCount: 42,
        loading: false,
      })

      expect(getByTestId('breadcrumb-product-counter')).toHaveTextContent('42')
    })

    it('treats a missing loading prop as settled', async () => {
      const { getByTestId } = await renderBreadcrumbs({ productsCount: 42 })

      expect(getByTestId('breadcrumb-product-counter')).toHaveTextContent('42')
    })

    it('shows a count of zero, which is a value rather than an absent one', async () => {
      const { getByTestId } = await renderBreadcrumbs({ productsCount: 0 })

      expect(getByTestId('breadcrumb-product-counter')).toHaveTextContent('0')
    })

    it('hides the badge while the products request is pending', async () => {
      const { queryByTestId } = await renderBreadcrumbs({
        productsCount: 42,
        loading: true,
      })

      expect(
        queryByTestId('breadcrumb-product-counter'),
      ).not.toBeInTheDocument()
    })

    it('hides the badge when no count is available', async () => {
      const { queryByTestId } = await renderBreadcrumbs({ loading: false })

      expect(
        queryByTestId('breadcrumb-product-counter'),
      ).not.toBeInTheDocument()
    })

    it('hides the badge while pending without a count', async () => {
      const { queryByTestId } = await renderBreadcrumbs({ loading: true })

      expect(
        queryByTestId('breadcrumb-product-counter'),
      ).not.toBeInTheDocument()
    })
  })

  describe('fade transition', () => {
    // `rerender` from `@nuxt/test-utils` references `nextTick` without importing
    // it and throws, so a host component drives the props instead.
    const renderWithControllableProps = (initial: {
      productsCount?: number
      loading: boolean
    }) => {
      const loading = ref(initial.loading)
      const productsCount = ref(initial.productsCount)

      const host = defineComponent({
        name: 'BreadcrumbsHost',
        setup: () => () =>
          h(SFCategoryBreadcrumbs, {
            category,
            loading: loading.value,
            productsCount: productsCount.value,
          }),
      })

      return { loading, productsCount, rendered: renderSuspended(host) }
    }

    it('mounts the badge when loading turns false', async () => {
      const { loading, rendered } = renderWithControllableProps({
        productsCount: 42,
        loading: true,
      })
      const { queryByTestId } = await rendered

      expect(
        queryByTestId('breadcrumb-product-counter'),
      ).not.toBeInTheDocument()

      loading.value = false
      await nextTick()

      expect(queryByTestId('breadcrumb-product-counter')).toHaveTextContent(
        '42',
      )
    })

    it('unmounts and remounts the badge on every loading change, which is what the fade makes visible', async () => {
      // The page must therefore only pass a loading flag driven by the request
      // that produces the count. A flag covering unrelated requests replays the
      // fade while the number stays the same, which reads as a flicker.
      const { loading, rendered } = renderWithControllableProps({
        productsCount: 42,
        loading: false,
      })
      const { queryByTestId } = await rendered

      expect(queryByTestId('breadcrumb-product-counter')).toBeInTheDocument()

      loading.value = true
      await nextTick()

      expect(
        queryByTestId('breadcrumb-product-counter'),
      ).not.toBeInTheDocument()

      loading.value = false
      await nextTick()

      expect(queryByTestId('breadcrumb-product-counter')).toBeInTheDocument()
    })

    it('keeps the badge mounted when only the count changes', async () => {
      const { productsCount, rendered } = renderWithControllableProps({
        productsCount: 42,
        loading: false,
      })
      const { getByTestId } = await rendered

      productsCount.value = 43
      await nextTick()

      expect(getByTestId('breadcrumb-product-counter')).toHaveTextContent('43')
    })
  })
})

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RecentlyViewedProductsComponentVue from './RecentlyViewedProductsComponent.vue'

vi.mock('#storefront-product-detail/composables', () => ({
  useRecentlyViewedProducts: () => ({
    loadMissingProducts: vi.fn(),
  }),
}))

describe('Amplience RecentlyViewedProductsComponent', () => {
  it('mounts successfully', () => {
    const wrapper = mount(RecentlyViewedProductsComponentVue, {
      props: {
        contentElement: {
          headline: 'Recently viewed',
        },
      },
      global: {
        stubs: {
          SFRecentlyViewedProductsSlider: true,
          SFSliderArrowButton: true,
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})

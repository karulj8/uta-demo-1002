import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductSliderComponentVue from './ProductSliderComponent.vue'

vi.mock('#storefront/composables', () => ({
  useProductsByIds: () => ({
    data: { value: [] },
    status: { value: 'success' },
  }),
}))

describe('Amplience ProductSliderComponent', () => {
  it('mounts with product ids', () => {
    const wrapper = mount(ProductSliderComponentVue, {
      props: {
        contentElement: {
          headline: 'Featured',
          product_ids: [1, 2],
        },
      },
      global: {
        stubs: { SFBaseProductSlider: true },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductListingPageComponent from './ProductListingPageComponent.vue'

vi.mock('../composables/useCMSBySlug', () => ({
  useCMSBySlug: vi.fn().mockResolvedValue({
    data: { value: null },
  }),
}))

describe('Amplience ProductListingPageComponent', () => {
  it('mounts without PLP content', async () => {
    const wrapper = mount(ProductListingPageComponent, {
      props: { categoryId: 100, contentType: 'teaser' },
      global: {
        stubs: { AmplienceComponent: true },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})

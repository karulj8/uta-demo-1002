import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SectionComponentVue from './SectionComponent.vue'

vi.mock('#imports', () => ({
  useImage: () => ({
    options: { format: ['avif'] },
    getSizes: () => ({ src: 'bg.jpg', sizes: '100vw', srcset: 'bg.jpg 1x' }),
  }),
}))

vi.mock('#app/nuxt', () => ({
  useRuntimeConfig: () => ({
    public: { storefrontUI: { breakpoints: { lg: 1024 } } },
  }),
  useNuxtApp: () => ({
    $img: {
      options: { format: ['avif'] },
      getSizes: () => ({ src: 'bg.jpg', sizes: '100vw', srcset: 'bg.jpg 1x' }),
    },
  }),
}))

describe('Amplience SectionComponent', () => {
  it('mounts with section content', () => {
    const wrapper = mount(SectionComponentVue, {
      props: {
        contentElement: {
          content: [],
          padding: 'medium',
        },
      },
      global: {
        stubs: { AmplienceComponent: true },
      },
    })

    expect(wrapper.find('section').exists()).toBe(true)
  })
})

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageComponentVue from './ImageComponent.vue'

vi.mock('#imports', () => ({
  useImage: () => ({
    options: { format: ['avif'] },
    getSizes: () => ({
      src: 'test.jpg',
      sizes: '100vw',
      srcset: 'test.jpg 1x',
    }),
  }),
}))

vi.mock('#app/nuxt', () => ({
  useRuntimeConfig: () => ({
    public: { storefrontUI: { breakpoints: { lg: 1024 } } },
  }),
  useNuxtApp: () => ({
    $img: {
      options: { format: ['avif'] },
      getSizes: () => ({
        src: 'test.jpg',
        sizes: '100vw',
        srcset: 'test.jpg 1x',
      }),
    },
  }),
}))

describe('Amplience ImageComponent', () => {
  it('mounts with image link data', () => {
    const wrapper = mount(ImageComponentVue, {
      props: {
        contentElement: {
          alt_text: 'Hero',
          image_desktop: {
            defaultHost: 'cdn.media.amplience.net',
            endpoint: 'test',
            name: 'hero',
          },
        },
      },
    })

    expect(wrapper.attributes('data-amplience-field-id')).toBe('image_desktop')
  })
})

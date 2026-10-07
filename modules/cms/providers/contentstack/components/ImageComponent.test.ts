import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { ImageComponent, File } from '../types/gen/contentstack'
import ImageComponentVue from './ImageComponent.vue'

const vLivePreviewMock = {
  beforeMount: () => {},
  updated: () => {},
}

vi.mock('#imports', () => ({
  useImage: vi.fn(() => ({
    options: {
      format: ['webp', 'jpeg'],
    },
    getSizes: vi.fn((src, options) => ({
      src: src,
      srcset: `${src} 1x, ${src} 2x`,
      sizes: options.sizes || '100vw',
    })),
  })),
}))

vi.mock('#app/nuxt', () => ({
  useRuntimeConfig: vi.fn(() => ({
    public: {
      storefrontUI: {
        breakpoints: {
          lg: 1024,
        },
      },
    },
    app: {
      baseURL: '/',
    },
  })),
  useNuxtApp: vi.fn(() => ({
    $img: null,
    _img: null,
    ssrContext: null,
  })),
}))

vi.mock('#build/image-options.mjs', () => ({
  imageOptions: {
    format: ['webp', 'jpeg'],
    densities: [1, 2],
    providers: {
      contentstack: {
        name: 'contentstack',
      },
    },
  },
}))

describe('Contentstack Image Component', () => {
  const createWrapper = (contentElement: Partial<ImageComponent>) => {
    return mount(ImageComponentVue, {
      props: {
        contentElement: {
          uid: 'test-image',
          _content_type_uid: 'image-component',
          image_desktop: {
            url: 'https://images.contentstack.io/abc123/1920x1080/test-image.jpg',
            dimension: {
              width: 1920,
              height: 1080,
            },
          } as unknown as File,
          alt_text: 'Test image',
          ...contentElement,
        } as ImageComponent,
      },
      global: {
        directives: {
          'live-preview': vLivePreviewMock,
        },
      },
    })
  }

  const mockImageFile = {
    uid: 'test-image-1',
    url: 'https://images.contentstack.io/abc123/1920x1080/test-image.jpg',
    dimension: {
      width: 1920,
      height: 1080,
    },
  } as unknown as File

  const mockImageFileWithoutDetails = {
    uid: 'test-image-2',
    url: 'https://images.contentstack.io/def456/800x600/test-image-2.jpg',
  } as unknown as File

  it('renders image when imageDesktop is provided', () => {
    const wrapper = createWrapper({
      image_desktop: mockImageFile,
      image_mobile: undefined,
      alt_text: 'Test image',
      aspect_ratio_desktop: undefined,
      aspect_ratio_mobile: undefined,
    })

    const picture = wrapper.find('picture')
    expect(picture.exists()).toBe(true)

    const sources = wrapper.findAll('source')
    expect(sources.length).toBeGreaterThan(0)

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Test image')
  })

  it('renders multiple sources when both mobile and desktop images are provided', () => {
    const wrapper = createWrapper({
      image_desktop: mockImageFile,
      image_mobile: mockImageFileWithoutDetails,
      alt_text: 'Test mobile image',
      aspect_ratio_desktop: undefined,
      aspect_ratio_mobile: undefined,
    })

    console.log(wrapper.html())
    const picture = wrapper.find('picture')
    expect(picture.exists()).toBe(true)

    const sources = wrapper.findAll('source')
    expect(sources.length).toBeGreaterThan(0)

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Test mobile image')
  })

  describe('aspect ratio calculations', () => {
    it('calculates correct aspect ratio for 16:9', () => {
      const wrapper = createWrapper({
        image_desktop: mockImageFile,
        image_mobile: undefined,
        aspect_ratio_desktop: '16:9',
        aspect_ratio_mobile: undefined,
        alt_text: 'Alt',
      })

      const container = wrapper.find('div')
      const style = container.attributes('style')
      expect(style).toContain('--desktop-aspect-ratio: 16/9')
    })

    it('calculates correct aspect ratio for 1:1', () => {
      const wrapper = createWrapper({
        image_desktop: mockImageFile,
        image_mobile: undefined,
        aspect_ratio_desktop: '1:1',
        aspect_ratio_mobile: undefined,
        alt_text: 'Alt',
      })

      const container = wrapper.find('div')
      const style = container.attributes('style')
      expect(style).toContain('--desktop-aspect-ratio: 1/1')
    })

    it('calculates correct aspect ratio for 3:4', () => {
      const wrapper = createWrapper({
        image_desktop: mockImageFile,
        image_mobile: undefined,
        aspect_ratio_desktop: '3:4',
        aspect_ratio_mobile: undefined,
        alt_text: 'Alt',
      })

      const container = wrapper.find('div')
      const style = container.attributes('style')
      expect(style).toContain('--desktop-aspect-ratio: 3/4')
    })

    it('calculates correct aspect ratio for original', () => {
      const wrapper = createWrapper({
        image_desktop: mockImageFile,
        image_mobile: undefined,
        aspect_ratio_desktop: 'original',
        aspect_ratio_mobile: undefined,
        alt_text: 'Alt',
      })

      const container = wrapper.find('div')
      const style = container.attributes('style')
      expect(style).toContain('--desktop-aspect-ratio: 1920/1080')
    })

    it('handles image without details by using provided dimensions', () => {
      const wrapper = createWrapper({
        image_desktop: mockImageFileWithoutDetails,
        image_mobile: undefined,
        aspect_ratio_desktop: 'original',
        aspect_ratio_mobile: undefined,
        alt_text: 'Alt',
      })

      const container = wrapper.find('div')
      const style = container.attributes('style')
      expect(style).toContain('--desktop-aspect-ratio: auto')
    })

    it('should set mobile and desktop aspect ratio when both are provided', () => {
      const wrapper = createWrapper({
        image_desktop: mockImageFile,
        image_mobile: mockImageFileWithoutDetails,
        alt_text: 'Alt',
        aspect_ratio_desktop: '16:9',
        aspect_ratio_mobile: '4:3',
      })

      const container = wrapper.find('div')
      const style = container.attributes('style')
      expect(style).toContain('--desktop-aspect-ratio: 16/9')
      expect(style).toContain('--mobile-aspect-ratio: 4/3')
    })

    it('sets correct max-width and max-height based on image dimensions', () => {
      const wrapper = createWrapper({
        image_desktop: mockImageFile,
        image_mobile: undefined,
        aspect_ratio_desktop: undefined,
        aspect_ratio_mobile: undefined,
        alt_text: 'Alt',
      })

      const container = wrapper.find('div')
      const style = container.attributes('style')
      expect(style).toContain('--desktop-max-width: 1920px')
      expect(style).toContain('--desktop-max-height: 1080px')
    })
  })
})

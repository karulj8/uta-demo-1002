import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VideoComponent } from '../types/gen/contentstack'
import VideoComponentVue from './VideoComponent.vue'

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
  useRuntimeConfig: vi.fn(() => ({
    public: {
      storefrontUI: {
        breakpoints: {
          lg: 1024,
        },
      },
    },
  })),
  nextTick: vi.fn(() => Promise.resolve()),
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

vi.mock('vue', async () => {
  const actual = (await vi.importActual('vue')) as {
    ref: (value: unknown) => { value: unknown }
  }
  return {
    ...actual,
    useTemplateRef: vi.fn((key: string) => {
      if (key === 'videoEl') {
        return actual.ref({ play: vi.fn() })
      }
      return actual.ref(null)
    }),
  }
})

vi.mock('~~/modules/cms/utils/image', () => ({
  getImageSources: vi.fn(() => [
    {
      src: 'https://example.com/image.webp',
      type: 'image/webp',
      sizes: '100vw',
      srcset: 'https://example.com/image.webp 1x',
      media: '(width >= 1024px)',
    },
  ]),
}))

describe('Contentstack Video Component', () => {
  const createWrapper = (contentElement: Partial<VideoComponent>) => {
    return mount(VideoComponentVue, {
      props: {
        contentElement: {
          uid: 'test-video',
          _content_type_uid: 'video-component',
          video: {
            url: 'https://videos.contentstack.io/123456/video.mp4',
          } as unknown as File,
          previewimagedesktop: {
            url: 'https://images.contentstack.io/123456/1920x1080/abc123/preview.jpg',
          } as unknown as File,
          autoplay: false,
          ...contentElement,
        } as VideoComponent,
      },
      global: {
        directives: {
          'live-preview': vLivePreviewMock,
        },
        stubs: {
          SFButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    })
  }

  const mockVideoFile = {
    url: 'https://videos.contentstack.io/123456/video.mp4',
  }

  const mockPreviewImageFile = {
    url: 'https://images.contentstack.io/123456/1920x1080/abc123/preview.jpg',
  }

  const createMockContentElement = (overrides = {}) =>
    ({
      video: mockVideoFile,
      previewimagedesktop: mockPreviewImageFile,
      autoplay: false,
      ...overrides,
    }) as unknown as VideoComponent

  it('renders preview image and play button when not autoplaying', () => {
    const wrapper = createWrapper(createMockContentElement())

    const picture = wrapper.find('picture')
    expect(picture.exists()).toBe(true)

    const playButton = wrapper.find('button')
    expect(playButton.exists()).toBe(true)
    expect(playButton.text()).toBe('▶')

    const video = wrapper.find('video')
    expect(video.exists()).toBe(false)
  })

  it('renders video element when autoplay is true', () => {
    const wrapper = createWrapper(createMockContentElement({ autoplay: true }))

    const video = wrapper.find('video')
    expect(video.exists()).toBe(true)
    expect(video.attributes('src')).toBe(mockVideoFile.url)
    expect(video.attributes('autoplay')).toBeDefined()
  })

  it('sets correct video attributes based on props', () => {
    const wrapper = createWrapper(
      createMockContentElement({
        autoplay: true,
        muted: false,
        loop: false,
        show_controls: true,
      }),
    )

    const video = wrapper.find('video')
    expect(video.attributes('muted')).toBeUndefined()
    expect(video.attributes('loop')).toBeUndefined()
    expect(video.attributes('controls')).toBeDefined()
  })

  describe('aspect ratio calculations', () => {
    it('sets correct aspect ratio for 16:9', () => {
      const wrapper = createWrapper(
        createMockContentElement({
          aspect_ratio: '16:9',
        }),
      )

      const container = wrapper.find('div')
      const style = container.attributes('style')
      expect(style).toContain('--aspect-ratio: 16/9')
    })

    it('sets correct aspect ratio for 1:1', () => {
      const wrapper = createWrapper(
        createMockContentElement({
          aspect_ratio: '1:1',
        }),
      )

      const container = wrapper.find('div')
      const style = container.attributes('style')
      expect(style).toContain('--aspect-ratio: 1/1')
    })

    it('sets correct aspect ratio for 4:3', () => {
      const wrapper = createWrapper(
        createMockContentElement({
          aspect_ratio: '4:3',
        }),
      )

      const container = wrapper.find('div')
      const style = container.attributes('style')
      expect(style).toContain('--aspect-ratio: 4/3')
    })

    it('defaults to 16:9 aspect ratio when not specified', () => {
      const wrapper = createWrapper(createMockContentElement())

      const container = wrapper.find('div')
      const style = container.attributes('style')
      expect(style).toContain('--aspect-ratio: 16/9')
    })
  })

  it('starts video when play button is clicked', async () => {
    const wrapper = createWrapper(createMockContentElement())

    const playButton = wrapper.find('button')
    await playButton.trigger('click')

    // Wait for next tick and re-check
    await wrapper.vm.$nextTick()

    // After clicking play, the video should be visible
    const video = wrapper.find('video')
    expect(video.exists()).toBe(true)
  })
})

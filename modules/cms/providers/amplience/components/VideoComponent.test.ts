import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import VideoComponentVue from './VideoComponent.vue'

const { useAsyncDataMock, fetchMock, warnMock } = vi.hoisted(() => ({
  useAsyncDataMock: vi.fn(),
  fetchMock: vi.fn(),
  warnMock: vi.fn(),
}))

vi.stubGlobal('$fetch', fetchMock)

vi.mock('#imports', () => ({
  useImage: () => ({
    options: { format: ['avif'] },
    getSizes: () => ({
      src: 'poster.jpg',
      sizes: '100vw',
      srcset: 'poster.jpg 1x',
    }),
  }),
}))

vi.mock('#app/composables/asyncData', () => ({
  useAsyncData: useAsyncDataMock,
}))

vi.mock('#app/nuxt', () => ({
  useRuntimeConfig: () => ({
    public: { storefrontUI: { breakpoints: { lg: 1024 } } },
  }),
  useNuxtApp: () => ({
    $img: {
      options: { format: ['avif'] },
      getSizes: () => ({
        src: 'poster.jpg',
        sizes: '100vw',
        srcset: 'poster.jpg 1x',
      }),
    },
  }),
}))

vi.mock('#storefront/composables', () => ({
  useLog: () => ({ warn: warnMock }),
}))

const videoLink = {
  id: 'video-1',
  name: 'hero-video',
  endpoint: 'test',
  defaultHost: 'cdn.media.amplience.net',
}

const metadata = {
  media: [
    {
      src: 'https://cdn.media.amplience.net/v/test/hero-video/mp4_720p',
      profile: 'mp4_720p',
      format: 'mpeg4',
      bitrate: '2020',
    },
    {
      src: 'https://cdn.media.amplience.net/v/test/hero-video/mp4_240p',
      profile: 'mp4_240p',
      format: 'mpeg4',
      bitrate: '328',
    },
  ],
}

describe('Amplience VideoComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAsyncDataMock.mockImplementation(
      (_key: unknown, handler: () => Promise<unknown>) => {
        const data = ref<unknown>(null)
        void handler().then((result) => {
          data.value = result
          return result
        })
        return { data }
      },
    )
  })

  it('shows the poster until video metadata is fetched', () => {
    fetchMock.mockReturnValue(new Promise(() => undefined))

    const wrapper = mount(VideoComponentVue, {
      props: {
        contentElement: {
          video: videoLink,
          autoplay: true,
        },
      },
      global: {
        stubs: { SFButton: true },
      },
    })

    expect(wrapper.find('video').exists()).toBe(false)
    expect(wrapper.find('img').attributes('src')).toBe(
      'https://cdn.media.amplience.net/v/test/hero-video',
    )
    expect(wrapper.findComponent({ name: 'SFButton' }).exists()).toBe(false)
  })

  it('builds sources from metadata and autoplays when ready', async () => {
    fetchMock.mockResolvedValue(metadata)

    const wrapper = mount(VideoComponentVue, {
      props: {
        contentElement: {
          video: videoLink,
          autoplay: true,
        },
      },
      global: {
        stubs: {
          SFButton: true,
          video: {
            template: '<video><slot /></video>',
            methods: { play: vi.fn() },
          },
        },
      },
    })

    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith(
      'https://cdn.media.amplience.net/v/test/hero-video.json',
    )

    const sources = wrapper.findAll('source')
    expect(sources).toHaveLength(2)
    expect(sources[0]?.attributes('src')).toBe(
      'https://cdn.media.amplience.net/v/test/hero-video/mp4_720p?protocol=https',
    )
    expect(sources[1]?.attributes('src')).toContain('mp4_240p')
    expect(wrapper.find('video').attributes('poster')).toBe(
      'https://cdn.media.amplience.net/v/test/hero-video',
    )
  })

  it('shows a play button when autoplay is disabled and metadata is ready', async () => {
    fetchMock.mockResolvedValue(metadata)

    const wrapper = mount(VideoComponentVue, {
      props: {
        contentElement: {
          video: videoLink,
          autoplay: false,
        },
      },
      global: {
        stubs: { SFButton: true },
      },
    })

    await flushPromises()

    expect(wrapper.find('video').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'SFButton' }).exists()).toBe(true)
  })

  it('keeps the poster when metadata fetch rejects', async () => {
    fetchMock.mockRejectedValue(new Error('network error'))

    const wrapper = mount(VideoComponentVue, {
      props: {
        contentElement: {
          video: videoLink,
          autoplay: true,
        },
      },
      global: {
        stubs: { SFButton: true },
      },
    })

    await flushPromises()

    expect(wrapper.find('video').exists()).toBe(false)
    expect(wrapper.find('img').attributes('src')).toBe(
      'https://cdn.media.amplience.net/v/test/hero-video',
    )
    expect(wrapper.findComponent({ name: 'SFButton' }).exists()).toBe(false)
    expect(warnMock).toHaveBeenCalledWith(
      'CMS: Amplience video metadata fetch failed for "test/hero-video"',
      expect.any(Error),
    )
  })

  it('keeps the poster when metadata has no media profiles', async () => {
    fetchMock.mockResolvedValue({ media: [] })

    const wrapper = mount(VideoComponentVue, {
      props: {
        contentElement: {
          video: videoLink,
          autoplay: true,
        },
      },
      global: {
        stubs: { SFButton: true },
      },
    })

    await flushPromises()

    expect(wrapper.find('video').exists()).toBe(false)
    expect(wrapper.find('img').attributes('src')).toBe(
      'https://cdn.media.amplience.net/v/test/hero-video',
    )
    expect(wrapper.findComponent({ name: 'SFButton' }).exists()).toBe(false)
  })
})

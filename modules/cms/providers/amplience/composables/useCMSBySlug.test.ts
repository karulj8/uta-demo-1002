import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ContentNotFoundError } from 'dc-delivery-sdk-js'
import { ref } from 'vue'
import { useCMSBySlug } from './useCMSBySlug'

const getContentItemByKey = vi.fn()
const handlerErrors: unknown[] = []
let capturedAsyncDataKey: string | undefined
let mockRoute = { query: {} as Record<string, string> }
let mockCms = {
  hubName: 'test-hub',
  allowDrafts: false,
}

vi.mock('#app/composables/asyncData', () => ({
  useAsyncData: (
    key: string,
    handler: () => Promise<unknown>,
    _options?: unknown,
  ) => {
    capturedAsyncDataKey = key
    const data = ref<unknown>()
    const status = ref('success')
    handler()
      .then((result) => {
        data.value = result
        return result
      })
      .catch((error) => {
        handlerErrors.push(error)
      })
    return { data, status, error: ref(null) }
  },
}))

vi.mock('#app/nuxt', () => ({
  useRuntimeConfig: () => ({
    public: {
      cms: mockCms,
      storefront: { rpcDefaultLazy: false },
    },
  }),
  useNuxtApp: () => ({
    $amplience: {
      getContentItemByKey,
    },
  }),
}))

vi.mock('#app/composables/router', () => ({
  useRoute: () => mockRoute,
}))

vi.mock('@scayle/storefront-nuxt/composables', () => ({
  useCurrentShop: () => ref({ locale: 'en-GB' }),
  useLog: () => ({ warn: vi.fn() }),
}))

vi.mock('#storefront/composables', () => ({
  useCurrentShop: () => ref({ locale: 'en-GB' }),
  useLog: () => ({ warn: vi.fn() }),
}))

describe('useCMSBySlug', () => {
  beforeEach(() => {
    getContentItemByKey.mockReset()
    handlerErrors.length = 0
    capturedAsyncDataKey = undefined
    mockRoute = { query: {} }
    mockCms = {
      hubName: 'test-hub',
      allowDrafts: false,
    }
  })

  it('fetches by a locale-prefixed delivery key', async () => {
    const item = { _meta: { deliveryKey: 'en-GB/content/about' } }
    getContentItemByKey.mockResolvedValueOnce(item)

    const { data } = await useCMSBySlug('about', 'content/about')

    await vi.waitFor(() => {
      expect(capturedAsyncDataKey).toBe('about:en-GB')
      expect(getContentItemByKey).toHaveBeenCalledWith('en-GB/content/about')
      expect(data.value).toEqual(item)
    })
  })

  it('resolves an empty slug to the locale homepage', async () => {
    getContentItemByKey.mockResolvedValueOnce({ _meta: {} })

    await useCMSBySlug('home', 'homepage')

    await vi.waitFor(() => {
      expect(getContentItemByKey).toHaveBeenCalledWith('en-GB/homepage')
    })
  })

  it('uses the editor delivery key override when preview is active', async () => {
    mockRoute = {
      query: {
        vse: 'preview.example.com',
        key: 'de-DE/content/about',
      },
    }
    mockCms.allowDrafts = true
    getContentItemByKey.mockResolvedValueOnce({ _meta: {} })

    await useCMSBySlug('about', 'content/about')

    await vi.waitFor(() => {
      expect(capturedAsyncDataKey).toBe(
        'about:preview:preview.example.com:de-DE/content/about',
      )
      expect(getContentItemByKey).toHaveBeenCalledWith('de-DE/content/about')
    })
  })

  it('returns null when no content item matches the delivery key', async () => {
    getContentItemByKey.mockRejectedValueOnce(
      new ContentNotFoundError('en-GB/content/missing'),
    )

    const { data } = await useCMSBySlug('missing', 'content/missing')

    await vi.waitFor(() => {
      expect(data.value).toBeNull()
    })
  })

  it('rethrows non-not-found errors', async () => {
    getContentItemByKey.mockRejectedValueOnce(new Error('auth failed'))

    await useCMSBySlug('missing', 'content/missing')

    await vi.waitFor(() => {
      expect(handlerErrors[0]).toBeInstanceOf(Error)
      expect((handlerErrors[0] as Error).message).toBe('auth failed')
    })
  })
})

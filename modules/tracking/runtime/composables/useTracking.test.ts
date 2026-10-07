import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
import type { CentAmount } from '@scayle/storefront-nuxt'
import type {
  TrackingPageContext,
  TrackingSessionContext,
  TrackingEvent,
} from '../types/tracking'
import { useTracking } from './useTracking'

const { pushMock } = vi.hoisted(() => {
  return {
    pushMock: vi.fn().mockImplementation(() => {}),
  }
})

const page = ref<Omit<TrackingPageContext, 'interaction_source'>>({
  current_page_path: '/p/123',
  current_page_type: 'product_detail',
  previous_page_path: '/',
  previous_page_type: 'homepage',
})

const session = ref<TrackingSessionContext>({
  shop_id: 1,
  shop_currency: 'EUR',
  locale: 'de-DE',
  shop_version: '1.0.0',
  landing_page: 'http://localhost:3000/',
  parameter: '',
  referrer: 'https://google.com',
  login: false,
})

vi.mock('./useTrackingContext', () => ({
  useTrackingContext: vi.fn(() => ({
    page,
    session,
  })),
}))

vi.mock('nuxt/app', () => ({
  useRuntimeConfig: vi.fn(() => ({
    public: {
      tracking: {
        gtm: {
          id: 'GTM-XXXXXX',
        },
      },
    },
  })),
}))

vi.mock('@scayle/storefront-nuxt/composables', () => ({
  useLog: vi.fn(() => console),
}))

mockNuxtImport('useScriptGoogleTagManager', () => {
  return () => ({
    proxy: {
      dataLayer: {
        push: pushMock,
        test: 1,
      },
    },
  })
})

describe('useTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    page.value = {
      current_page_path: '/p/123',
      current_page_type: 'product_detail',
      previous_page_path: '/',
      previous_page_type: 'homepage',
    }
    session.value = {
      shop_id: 1,
      shop_currency: 'EUR',
      locale: 'de-DE',
      shop_version: '1.0.0',
      landing_page: 'http://localhost:3000/',
      parameter: '',
      referrer: 'https://google.com',
      login: false,
    }
  })

  it('should push event with merged page and session context', () => {
    const { push } = useTracking()

    const eventData: TrackingEvent = {
      event: 'content_view',
      page: {
        interaction_source: 'country_detection_modal',
      },
      session: session.value,
    }

    push(eventData)

    expect(pushMock).toHaveBeenCalledWith({
      event: 'content_view',
      page: {
        current_page_path: '/p/123',
        current_page_type: 'product_detail',
        previous_page_path: '/',
        previous_page_type: 'homepage',
        interaction_source: 'country_detection_modal',
      },
      session: session.value,
    })
  })

  it('should push event without interaction_source when not provided', () => {
    const { push } = useTracking()

    const eventData: TrackingEvent = {
      event: 'view_item',
      page: {},
      session: session.value,
    }

    push(eventData)

    expect(pushMock).toHaveBeenCalledWith({
      event: 'view_item',
      page: {
        current_page_path: '/p/123',
        current_page_type: 'product_detail',
        previous_page_path: '/',
        previous_page_type: 'homepage',
        interaction_source: undefined,
      },
      session: session.value,
    })
  })

  it('should clear previous ecommerce object before pushing new ecommerce event', () => {
    const { push } = useTracking()

    const eventData: TrackingEvent = {
      event: 'add_to_cart',
      page: {},
      session: session.value,
      ecommerce: {
        items: [
          {
            item_id: '123',
            item_name: 'Test Product',
            price_with_tax: 10.1 as CentAmount,
            quantity: 1,
          },
        ],
      },
    }

    push(eventData)

    expect(pushMock).toHaveBeenCalledTimes(2)
    expect(pushMock).toHaveBeenNthCalledWith(1, { ecommerce: null })
    expect(pushMock).toHaveBeenNthCalledWith(2, {
      event: 'add_to_cart',
      page: {
        current_page_path: '/p/123',
        current_page_type: 'product_detail',
        previous_page_path: '/',
        previous_page_type: 'homepage',
        interaction_source: undefined,
      },
      session: session.value,
      ecommerce: {
        items: [
          {
            item_id: '123',
            item_name: 'Test Product',
            price_with_tax: 10.1,
            quantity: 1,
          },
        ],
      },
    })
  })

  it('should not clear ecommerce when event does not contain ecommerce', () => {
    const { push } = useTracking()

    const eventData: TrackingEvent = {
      event: 'content_view',
      page: {},
      session: session.value,
    }

    push(eventData)

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith(
      expect.not.objectContaining({ ecommerce: null }),
    )
  })

  it('should merge custom properties with page and session context', () => {
    const { push } = useTracking()

    const eventData: TrackingEvent = {
      event: 'search',
      page: {
        interaction_source: 'country_detection_modal',
      },
      session: session.value,
      search_term: 'shoes',
      custom_property: 'custom_value',
    }

    push(eventData)

    expect(pushMock).toHaveBeenCalledWith({
      event: 'search',
      page: {
        current_page_path: '/p/123',
        current_page_type: 'product_detail',
        previous_page_path: '/',
        previous_page_type: 'homepage',
        interaction_source: 'country_detection_modal',
      },
      session: session.value,
      search_term: 'shoes',
      custom_property: 'custom_value',
    })
  })

  it('should use reactive page and session context values', () => {
    const { push } = useTracking()

    // Update page context
    page.value = {
      current_page_path: '/c/456',
      current_page_type: 'product_listing',
      previous_page_path: '/p/123',
      previous_page_type: 'product_detail',
    }

    // Update session context
    session.value = {
      ...session.value,
      shop_id: 2,
      shop_currency: 'USD',
      locale: 'en-US',
    }

    push({
      event: 'page_view',
      page: {},
      session: session.value,
    })

    expect(pushMock).toHaveBeenCalledWith({
      event: 'page_view',
      page: {
        current_page_path: '/c/456',
        current_page_type: 'product_listing',
        previous_page_path: '/p/123',
        previous_page_type: 'product_detail',
        interaction_source: undefined,
      },
      session: {
        shop_id: 2,
        shop_currency: 'USD',
        locale: 'en-US',
        shop_version: '1.0.0',
        landing_page: 'http://localhost:3000/',
        parameter: '',
        referrer: 'https://google.com',
        login: false,
      },
    })
  })
})

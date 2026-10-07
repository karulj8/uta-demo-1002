import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { TrackingEvent } from '../types/tracking'
import { useGlobalEvents } from './useGlobalEvents'

const mocks = vi.hoisted(() => {
  return {
    push: vi.fn(),
  }
})

vi.mock('./useTracking', () => ({
  useTracking: vi.fn(() => ({
    push: mocks.push,
  })),
}))

vi.mock('@scayle/storefront-nuxt/composables', () => ({
  useLog: vi.fn(() => console),
}))
describe('useGlobalEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('trackContentView', () => {
    it('should track content view event with data', () => {
      const { trackContentView } = useGlobalEvents()

      const data: Partial<TrackingEvent> = {
        page: {
          current_page_path: '/content',
          current_page_type: 'content',
        },
        custom_property: 'custom_value',
      }

      trackContentView(data)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'content_view',
        page: {
          current_page_path: '/content',
          current_page_type: 'content',
        },
        custom_property: 'custom_value',
      })
    })

    it('should track content view event with empty data', () => {
      const { trackContentView } = useGlobalEvents()

      trackContentView({})

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'content_view',
      })
    })

    it('should track content view event with ecommerce data', () => {
      const { trackContentView } = useGlobalEvents()

      const data: Partial<TrackingEvent> = {
        ecommerce: {
          items: [
            {
              item_id: '123',
              item_name: 'Test Item',
            },
          ],
        },
      }

      trackContentView(data)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'content_view',
        ecommerce: {
          items: [
            {
              item_id: '123',
              item_name: 'Test Item',
            },
          ],
        },
      })
    })

    it('should track content view event with multiple custom properties', () => {
      const { trackContentView } = useGlobalEvents()

      const data: Partial<TrackingEvent> = {
        custom_property_1: 'value1',
        custom_property_2: 'value2',
        custom_property_3: 123,
      }

      trackContentView(data)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'content_view',
        custom_property_1: 'value1',
        custom_property_2: 'value2',
        custom_property_3: 123,
      })
    })
  })

  describe('trackShopInitialization', () => {
    it('should track shop initialization event', () => {
      const { trackShopInitialization } = useGlobalEvents()

      trackShopInitialization()

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'shop_init',
      })
    })
  })

  describe('trackError', () => {
    it('should track error event with code and message', () => {
      const { trackError } = useGlobalEvents()

      trackError({
        code: 404,
        message: 'Not Found',
      })

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'error',
        type: '404|Not Found',
      })
    })

    it('should track error event without code', () => {
      const { trackError } = useGlobalEvents()

      trackError({
        message: 'Internal Server Error',
      })

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'error',
        type: '|Internal Server Error',
      })
    })

    it('should track error event with code 0', () => {
      const { trackError } = useGlobalEvents()

      trackError({
        code: 0,
        message: 'Zero Error',
      })

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'error',
        type: '0|Zero Error',
      })
    })

    it('should track error event with empty message', () => {
      const { trackError } = useGlobalEvents()

      trackError({
        message: '',
      })

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'error',
        type: '|',
      })
    })
  })

  describe('trackShopSwitch', () => {
    it('should track shop switch event', () => {
      const { trackShopSwitch } = useGlobalEvents()

      trackShopSwitch()

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'shop_change',
      })
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { userFactory } from '@scayle/storefront-nuxt/test/factories'
import type { ShopUser } from '@scayle/storefront-nuxt'
import { useTrackingContext } from './useTrackingContext'
import packageJson from '~~/package.json'

const mocks = vi.hoisted(() => {
  return {
    route: {
      query: {},
      path: '/',
      meta: { pageType: 'homepage' },
    },
    customerType: {
      value: 'guest',
    },
    isLoggedIn: {
      value: false,
    },
  }
})

const currentShop = ref({
  shopId: 1,
  currency: 'EUR',
  locale: 'de-DE',
})

const user = ref<ShopUser | null>(null)

vi.mock('#app/composables/router', () => ({
  useRoute: vi.fn(() => mocks.route),
}))

vi.mock('@scayle/storefront-nuxt/composables', async () => {
  const actual = await vi.importActual<
    typeof import('@scayle/storefront-nuxt/composables')
  >('@scayle/storefront-nuxt/composables')

  return {
    ...actual,
    useCurrentShop: () => currentShop,
    useUser: () => ({
      user,
      customerType: mocks.customerType,
      isLoggedIn: mocks.isLoggedIn,
    }),
  }
})

describe('useTrackingContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.route = {
      path: '/',
      meta: { pageType: 'homepage' },
      query: {},
    }
    currentShop.value = {
      shopId: 1,
      currency: 'EUR',
      locale: 'de-DE',
    }
    user.value = null
    mocks.customerType.value = 'guest'
    mocks.isLoggedIn.value = false
  })

  describe('session context', () => {
    it('should return shop information from current shop', () => {
      currentShop.value = {
        shopId: 2,
        currency: 'USD',
        locale: 'en-US',
      }

      const { session } = useTrackingContext()

      expect(session.value.shop_id).toBe(2)
      expect(session.value.shop_currency).toBe('USD')
      expect(session.value.locale).toBe('en-US')
    })

    it('should return shop version from package.json', () => {
      const { session } = useTrackingContext()

      expect(session.value.shop_version).toBe(packageJson.version)
    })

    it('should return empty landing page initially', () => {
      const { session } = useTrackingContext()

      expect(session.value.landing_page).toBe('http://localhost:3000/')
    })

    it('should return empty parameter string when route has no query params', () => {
      const { session } = useTrackingContext()

      expect(session.value.parameter).toBe('')
    })

    it('should format query parameters as URL string', () => {
      mocks.route = {
        path: '/',
        meta: { pageType: 'homepage' },
        query: {
          utm_source: 'google',
          utm_campaign: 'summer',
        },
      }

      const { session } = useTrackingContext()

      expect(session.value.parameter).toContain('utm_source=google')
      expect(session.value.parameter).toContain('utm_campaign=summer')
      // eslint-disable-next-line sonarjs/super-linear-regex
      expect(session.value.parameter).toMatch(/^&.*&.*$/)
    })

    it('should return undefined referrer on server-side', () => {
      vi.stubGlobal('import.meta.client', false)

      const { session } = useTrackingContext()

      expect(session.value.referrer).toBe('')
    })

    it('should return document referrer on client-side', () => {
      vi.stubGlobal('import.meta.client', true)
      Object.defineProperty(document, 'referrer', {
        writable: true,
        value: 'https://google.com',
      })

      const { session } = useTrackingContext()

      expect(session.value.referrer).toBe('https://google.com')
    })

    describe('user information', () => {
      it('should return undefined customer_id when user is null', () => {
        user.value = null

        const { session } = useTrackingContext()

        expect(session.value.customer_id).toBeUndefined()
      })

      it('should return customer_id as string when user exists', () => {
        const testUser = userFactory.build({ id: 123 })
        user.value = testUser

        const { session } = useTrackingContext()

        expect(session.value.customer_id).toBe('123')
      })

      it('should return customer_type from useUser', () => {
        mocks.customerType.value = 'existing'

        const { session } = useTrackingContext()

        expect(session.value.customer_type).toBe('existing')
      })

      it('should return customer_groups when user has groups', () => {
        const testUser = userFactory.build({
          groups: ['vip', 'early-access'],
        })
        user.value = testUser

        const { session } = useTrackingContext()

        expect(session.value.customer_groups).toEqual(['vip', 'early-access'])
      })

      it('should return undefined customer_groups when user is null', () => {
        user.value = null

        const { session } = useTrackingContext()

        expect(session.value.customer_groups).toBeUndefined()
      })

      it('should return false login when user is guest', () => {
        mocks.isLoggedIn.value = false

        const { session } = useTrackingContext()

        expect(session.value.login).toBe(false)
      })

      it('should return true login when user is not guest', () => {
        mocks.isLoggedIn.value = true

        const { session } = useTrackingContext()

        expect(session.value.login).toBe(true)
      })

      it('should return login_method from user authentication', () => {
        const testUser = userFactory.build({
          authentication: { type: 'password' },
        })
        user.value = testUser

        const { session } = useTrackingContext()

        expect(session.value.login_method).toBe('password')
      })

      it('should return undefined login_method when user is null', () => {
        user.value = null

        const { session } = useTrackingContext()

        expect(session.value.login_method).toBeUndefined()
      })

      it('should return email hash from user', () => {
        const testUser = userFactory.build({
          email: 'test@example.com',
          emailHash: 'emailHash',
        })
        user.value = testUser

        const { session } = useTrackingContext()

        expect(session.value.eh).toBe('emailHash')
      })

      it('should return undefined email when user is null', () => {
        user.value = null

        const { session } = useTrackingContext()

        expect(session.value.eh).toBeUndefined()
      })
    })
  })

  describe('reactivity', () => {
    it('should reactively update session when shop changes', () => {
      const { session } = useTrackingContext()

      expect(session.value.shop_id).toBe(1)

      currentShop.value = {
        shopId: 3,
        currency: 'GBP',
        locale: 'en-GB',
      }

      expect(session.value.shop_id).toBe(3)
      expect(session.value.shop_currency).toBe('GBP')
      expect(session.value.locale).toBe('en-GB')
    })

    it('should reactively update session when user changes', () => {
      const { session } = useTrackingContext()

      expect(session.value.customer_id).toBeUndefined()

      const testUser = userFactory.build({ id: 789 })
      user.value = testUser

      expect(session.value.customer_id).toBe('789')
    })

    it('should reactively update parameter when route query changes', () => {
      mocks.route = {
        path: '/',
        meta: { pageType: 'homepage' },
        query: { sort: 'price' },
      }
      const { session } = useTrackingContext()

      expect(session.value.parameter).toContain('sort=price')
    })
  })
})

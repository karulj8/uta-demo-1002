import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSignInEvents } from './useSignInEvents'

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

describe('useSignInEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('trackSignUp', () => {
    it('should track successful sign-up event', () => {
      const { trackSignUp } = useSignInEvents()

      trackSignUp(true)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'sign_up',
        status: 'successful',
      })
    })

    it('should track failed sign-up event', () => {
      const { trackSignUp } = useSignInEvents()

      trackSignUp(false)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'sign_up',
        status: 'error',
      })
    })

    it('should track sign-up event with different success values', () => {
      const { trackSignUp } = useSignInEvents()

      trackSignUp(true)
      expect(mocks.push).toHaveBeenCalledWith({
        event: 'sign_up',
        status: 'successful',
      })

      vi.clearAllMocks()

      trackSignUp(false)
      expect(mocks.push).toHaveBeenCalledWith({
        event: 'sign_up',
        status: 'error',
      })
    })
  })

  describe('trackLogin', () => {
    it('should track successful login event', () => {
      const { trackLogin } = useSignInEvents()

      trackLogin(true)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'login',
        status: 'successful',
      })
    })

    it('should track failed login event', () => {
      const { trackLogin } = useSignInEvents()

      trackLogin(false)

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'login',
        status: 'error',
      })
    })

    it('should track login event with different success values', () => {
      const { trackLogin } = useSignInEvents()

      trackLogin(true)
      expect(mocks.push).toHaveBeenCalledWith({
        event: 'login',
        status: 'successful',
      })

      vi.clearAllMocks()

      trackLogin(false)
      expect(mocks.push).toHaveBeenCalledWith({
        event: 'login',
        status: 'error',
      })
    })
  })

  describe('trackLogout', () => {
    it('should track logout event', () => {
      const { trackLogout } = useSignInEvents()

      trackLogout()

      expect(mocks.push).toHaveBeenCalledWith({
        event: 'logout',
      })
    })

    it('should track logout event multiple times', () => {
      const { trackLogout } = useSignInEvents()

      trackLogout()
      trackLogout()
      trackLogout()

      expect(mocks.push).toHaveBeenCalledTimes(3)
      expect(mocks.push).toHaveBeenCalledWith({
        event: 'logout',
      })
    })
  })
})

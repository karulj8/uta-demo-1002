import { describe, expect, it, vi } from 'vitest'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
import { fireEvent } from '@testing-library/vue'
import SFUserActions from './SFUserActions.vue'

const { useUser, useAuthentication, trackError } = vi.hoisted(() => {
  return {
    useUser: vi.fn(),
    useAuthentication: vi.fn(),
    trackError: vi.fn(),
  }
})

vi.mock('#storefront/composables', async () => {
  const actual = await vi.importActual('#storefront/composables')
  return {
    ...actual,
    useUser,
    useCurrentShop: () => ref({ locale: new Intl.Locale('de-DE') }),
  }
})
vi.mock('~/composables', async () => {
  const actual = await vi.importActual('~/composables')
  return {
    ...actual,
    useAuthentication,
  }
})

vi.mock('#tracking/composables', async () => {
  return {
    useGlobalEvents: vi.fn().mockReturnValue({
      trackError,
    }),
  }
})

const logoutMock = vi.fn()
useAuthentication.mockReturnValue({
  isSubmitting: ref(false),
  logout: logoutMock,
})

describe('logged in user', () => {
  it('should render with links', async () => {
    useUser.mockReturnValue({
      user: ref({
        email: 'user@scayle.com',
        firstName: 'John',
        lastName: 'Doe',
        status: {
          isGuestCustomer: false,
        },
      }),
    })
    const { getByText, getByRole } = await renderSuspended(SFUserActions)

    expect(getByText('Hello John')).toBeTruthy()
    expect(getByText('user@scayle.com')).toBeTruthy()

    const settingsLink = getByRole('link', { name: 'Account Settings' })
    expect(settingsLink).toBeInTheDocument()
    expect(settingsLink).toHaveAttribute('href', '/en/account/profile')

    const ordersLink = getByRole('link', { name: 'Your Orders' })
    expect(ordersLink).toBeInTheDocument()
    expect(ordersLink).toHaveAttribute('href', '/en/account/orders')

    const subscriptionLink = getByRole('link', { name: 'Your Subscriptions' })
    expect(subscriptionLink).toBeInTheDocument()
    expect(subscriptionLink).toHaveAttribute(
      'href',
      '/en/account/subscriptions',
    )

    expect(getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
  })

  it('should emit "close" event when link is clicked', async () => {
    useUser.mockReturnValue({
      user: ref({
        email: 'user@scayle.com',
        firstName: 'John',
        lastName: 'Doe',
        status: {
          isGuestCustomer: false,
        },
      }),
    })
    const { emitted, getAllByRole } = await renderSuspended(SFUserActions)
    const links = getAllByRole('link')

    await Promise.all(links.map((link) => fireEvent.click(link)))

    expect(emitted()['close']).toHaveLength(3)
  })
})

describe('guest user', () => {
  it('should not render links', async () => {
    useUser.mockReturnValue({
      user: ref({
        email: 'user@scayle.com',
        firstName: 'John',
        lastName: 'Doe',
        status: {
          isGuestCustomer: true,
        },
      }),
    })
    const { getByText, queryByRole, getByRole } =
      await renderSuspended(SFUserActions)

    expect(getByText('Hello John')).toBeTruthy()
    expect(getByText('user@scayle.com')).toBeTruthy()

    const settingsLink = queryByRole('link', { name: 'Your Account' })
    expect(settingsLink).not.toBeInTheDocument()

    const ordersLink = queryByRole('link', { name: 'Your Orders' })
    expect(ordersLink).not.toBeInTheDocument()

    const subscriptionLink = queryByRole('link', { name: 'Your Subscriptions' })
    expect(subscriptionLink).not.toBeInTheDocument()

    expect(getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
  })
})

it('should trigger an logout and emit "close" event when logout is clicked', async () => {
  useUser.mockReturnValue({
    user: ref({
      email: 'user@scayle.com',
      firstName: 'John',
      lastName: 'Doe',
      status: {
        isGuestCustomer: true,
      },
    }),
  })

  const { emitted, getByRole } = await renderSuspended(SFUserActions)
  const logoutButton = getByRole('button', { name: 'Sign Out' })

  await fireEvent.click(logoutButton)

  expect(logoutMock).toBeCalledTimes(1)
  expect(emitted()['close']).toHaveLength(1)
})

it('should trigger an error if the logout fails', async () => {
  useUser.mockReturnValue({
    user: ref({
      email: 'user@scayle.com',
      firstName: 'John',
      lastName: 'Doe',
      status: {
        isGuestCustomer: true,
      },
    }),
  })

  logoutMock.mockRejectedValue(new Error('Logout failed'))

  const { getByRole } = await renderSuspended(SFUserActions)
  const logoutButton = getByRole('button', { name: 'Sign Out' })

  await fireEvent.click(logoutButton)

  expect(trackError).toBeCalledTimes(1)
  expect(trackError).toBeCalledWith({ message: 'logout_error' })
})

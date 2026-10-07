import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useRequestOrigin } from './useRequestOrigin'

const requestURL = vi.fn()
const requestHeaders = vi.fn()
const currentShop = ref<{ domain?: string }>({})

vi.mock('#app', () => ({
  useRequestURL: () => requestURL(),
  // Mirrors the real filtering: only the headers the caller asks for come back,
  // so a test cannot rely on one the composable never requests.
  useRequestHeaders: (names?: string[]) =>
    names
      ? Object.fromEntries(
          Object.entries(requestHeaders() as Record<string, string>).filter(
            ([name]) => names.includes(name),
          ),
        )
      : requestHeaders(),
}))

vi.mock('#storefront/composables', () => ({
  useCurrentShop: () => currentShop,
}))

describe('useRequestOrigin', () => {
  beforeEach(() => {
    currentShop.value = {}
    requestURL.mockReturnValue(new URL('http://127.0.0.1:3000/de'))
    requestHeaders.mockReturnValue({})
  })

  it('prefers the forwarded host over the internal upstream host', () => {
    requestHeaders.mockReturnValue({
      'x-forwarded-host': 'www.example.com',
      'x-forwarded-proto': 'https',
    })

    expect(useRequestOrigin()).toBe('https://www.example.com')
  })

  it('takes the last forwarded-host entry, which the deployment controls', () => {
    // A proxy that appends instead of stripping leaves the client value first.
    requestHeaders.mockReturnValue({
      'x-forwarded-host': 'attacker.example, www.example.com',
      'x-forwarded-proto': 'http, https',
    })

    expect(useRequestOrigin()).toBe('https://www.example.com')
  })

  it('lets the configured shop domain win over a forwarded host', () => {
    currentShop.value = { domain: 'www.example.com' }
    requestHeaders.mockReturnValue({
      'x-forwarded-host': 'attacker.example',
      'x-forwarded-proto': 'https',
    })

    expect(useRequestOrigin()).toBe('https://www.example.com')
  })

  it('falls back to the request host when no forwarded host arrives', () => {
    requestURL.mockReturnValue(new URL('https://www.example.com/de'))

    expect(useRequestOrigin()).toBe('https://www.example.com')
  })

  it('keeps the port of a forwarded host that carries one', () => {
    requestHeaders.mockReturnValue({ 'x-forwarded-host': 'de.localhost:3000' })

    expect(useRequestOrigin()).toBe('http://de.localhost:3000')
  })

  it.each([
    ['javascript:alert(1)//'],
    ['data:text/html,'],
    ['not-a-scheme'],
    [''],
    [','],
    ['  ,  '],
  ])(
    'ignores %s as a forwarded protocol and keeps the request scheme',
    (forwardedProto) => {
      requestURL.mockReturnValue(new URL('https://www.example.com/de'))
      requestHeaders.mockReturnValue({ 'x-forwarded-proto': forwardedProto })

      expect(useRequestOrigin()).toBe('https://www.example.com')
    },
  )

  it('accepts a forwarded protocol regardless of case and trailing colon', () => {
    requestHeaders.mockReturnValue({
      'x-forwarded-host': 'www.example.com',
      'x-forwarded-proto': 'HTTPS:',
    })

    expect(useRequestOrigin()).toBe('https://www.example.com')
  })

  it.each([[','], ['  ,  '], ['']])(
    'falls back to the request host for a forwarded host of %o',
    (forwardedHost) => {
      requestURL.mockReturnValue(new URL('https://www.example.com/de'))
      requestHeaders.mockReturnValue({ 'x-forwarded-host': forwardedHost })

      expect(useRequestOrigin()).toBe('https://www.example.com')
    },
  )

  it('ignores a forwarded header the composable does not request', () => {
    requestURL.mockReturnValue(new URL('https://www.example.com/de'))
    requestHeaders.mockReturnValue({ 'x-forwarded-server': 'attacker.example' })

    expect(useRequestOrigin()).toBe('https://www.example.com')
  })
})

import { expect, test } from '@playwright/test'
import { ROUTES } from '../../support/constants'

/**
 * @file Contains end-to-end tests for the public origin of absolute URLs.
 * This suite verifies that a client-sent `x-forwarded-host` cannot reach the
 * canonical link, the hreflang alternates or the JSON-LD of a rendered page.
 *
 * @note This test reads the raw response body instead of the rendered DOM.
 * Hydration rebuilds absolute URLs from `location.href` and repairs them in the
 * browser, so an assertion against the DOM passes while the served markup still
 * carries the forged host.
 *
 * @note The served markup is what makes a forged host spread. Cached routes are
 * marked `Cache-Control: public, s-maxage=600` and the route rules set
 * `headersOnly: true`, so Nitro stores no body itself and any shared cache in
 * front holds the response under a key that ignores `x-forwarded-host`. A second
 * request cannot observe that from here, which is why this suite asserts on the
 * body of the poisoned response rather than trying to read one back out.
 */

const FORGED_HOST = 'attacker.example'

/**
 * Reads the host that the deployment under test serves from, which is the value
 * a trusted proxy would append to `x-forwarded-host`.
 */
const publicHost = (baseURL: string | undefined) => {
  if (!baseURL) {
    throw new Error('BASE_URL must be set to resolve the public host')
  }
  return new URL(baseURL).host
}

test.describe('Absolute URL origin', () => {
  test('ignores a client-sent forwarded host in the served markup', async ({
    request,
    baseURL,
  }) => {
    const host = publicHost(baseURL)

    // A proxy that appends instead of stripping leaves the client value first
    // and its own value last. Only the last entry is trustworthy.
    const response = await request.get(ROUTES.homepageDefault, {
      headers: { 'x-forwarded-host': `${FORGED_HOST}, ${host}` },
    })
    const html = await response.text()

    expect(html).not.toContain(FORGED_HOST)
    expect(html).toContain(`<link rel="canonical"`)
    expect(html).toContain(host)
  })
})

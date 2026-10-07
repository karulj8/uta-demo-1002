import { useRequestHeaders, useRequestURL } from '#app'
import { useCurrentShop } from '#storefront/composables'

/**
 * Reads the last entry of a potentially comma-separated forwarded header.
 *
 * Proxies append rather than replace, so a request that passed through more
 * than one hop carries `client, proxy-1, proxy-2`. The last entry is the one
 * written by the hop closest to this server, the only hop the deployment
 * controls, while the first entry is whatever the client sent when a proxy
 * appends instead of stripping. h3 reads the first entry, which is why this
 * composable parses the header itself.
 *
 * @param value Raw header value, or undefined when the header is absent.
 * @returns The last entry with surrounding whitespace removed, or undefined
 *   when the header is absent or holds only empty entries.
 */
const lastHeaderValue = (value: string | undefined): string | undefined =>
  value?.split(',').at(-1)?.trim() || undefined

/**
 * Resolves the scheme for absolute URLs, without the trailing colon.
 *
 * Prefers `x-forwarded-proto`, because a TLS-terminating proxy forwards over
 * plain HTTP and the request protocol would otherwise emit `http://` links for
 * an HTTPS site. Only `http` and `https` are accepted, because the result is
 * concatenated into an origin string rather than passed through the URL parser:
 * an unchecked value would reach the canonical link verbatim, and one that is
 * not a legal scheme would make every later `new URL(origin)` throw.
 *
 * @param requestUrl URL of the current request, used as the fallback.
 * @param forwardedProto Raw `x-forwarded-proto` header value, if present.
 * @returns Either `http` or `https`.
 */
const resolveScheme = (
  requestUrl: URL,
  forwardedProto: string | undefined,
): string => {
  // Schemes are case-insensitive, so `HTTPS` from a proxy is as valid as `https`.
  const proto = lastHeaderValue(forwardedProto)?.replace(/:$/, '').toLowerCase()

  return proto === 'http' || proto === 'https'
    ? proto
    : requestUrl.protocol.replace(/:$/, '')
}

/**
 * Resolves the public-facing origin of the current request.
 *
 * Use this instead of `useRequestURL().origin` for every absolute URL rendered
 * into the document, meaning canonical links, hreflang alternates and JSON-LD,
 * so server-rendered markup and the hydrated DOM agree on the origin.
 *
 * The host resolves in this order:
 *
 * 1. The `domain` of the current shop, when the shop config sets one. In
 *    `domain` shop selector mode every shop configures its domain, so this
 *    always wins there. In `path` mode the field is optional and unset by
 *    default.
 * 2. The last entry of `x-forwarded-host`. Behind a reverse proxy the `Host`
 *    header holds the internal upstream address (for example `127.0.0.1:3000`)
 *    and the public host arrives in this header.
 * 3. The host of the request URL, which is the `Host` header on the server and
 *    the browser location on the client.
 *
 * @note Step 2 presumes a reverse proxy that appends to `x-forwarded-host`
 * instead of forwarding it untouched, so the last entry is one the deployment
 * wrote. Without such a proxy in front, a client-sent value is both the first
 * and the last entry and reading the last one protects nothing: a visitor then
 * chooses the host in every absolute URL the page renders. The route rules mark
 * these pages `Cache-Control: public, s-maxage=600`, so a shared cache in front
 * stores the response under a key that does not include `x-forwarded-host` and
 * serves the forged host to every later visitor and crawler until the entry
 * expires. Configure the shop `domain`
 * (`NUXT_STOREFRONT_SHOPS_{UNIQUE_IDENTIFIER}_DOMAIN`) to pin the origin to a
 * value the request cannot influence, or strip the header at the edge.
 *
 * @returns The public origin, made up of scheme, host and port.
 *
 * @example
 * ```ts
 * const origin = useRequestOrigin()
 * const canonical = sanitizeCanonicalURL(`${origin}${route.fullPath}`)
 * ```
 */
export function useRequestOrigin(): string {
  const requestUrl = useRequestURL()
  const currentShop = useCurrentShop()
  // Returns an empty object on the client, where the browser location is the
  // authoritative origin and no request headers exist.
  const headers = useRequestHeaders(['x-forwarded-host', 'x-forwarded-proto'])

  const scheme = resolveScheme(requestUrl, headers['x-forwarded-proto'])
  const host =
    currentShop.value?.domain ||
    lastHeaderValue(headers['x-forwarded-host']) ||
    requestUrl.host

  return `${scheme}://${host}`
}

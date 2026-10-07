/**
 * Amplience Dynamic Media URL helpers.
 *
 * Framework-free so both the Vue components (via `buildAmplienceImageUrl`) and the
 * `@nuxt/image` provider (`runtime/imageprovider`) can share the same host rewrite and
 * transform-parameter mapping without pulling in Nuxt server composables.
 */

/** Production Dynamic Media host used for published assets. */
export const AMPLIENCE_PRODUCTION_MEDIA_HOST = 'cdn.media.amplience.net'

/** Amplience video-link fields needed to build a Dynamic Media video URL. */
export type AmplienceVideoLink = {
  defaultHost: string
  endpoint: string
  name: string
}

/**
 * Single transcoded rendition from Amplience video metadata (`/v/...json`).
 *
 * @see https://amplience.com/developers/docs/apis/media-delivery/media-delivery-reference/#video
 */
export type AmplienceVideoMediaProfile = {
  /**
   * Delivery URL from Amplience metadata. Unused when building player sources:
   * `buildAmplienceVideoSourcesFromMetadata` rebuilds URLs from `profile` instead.
   */
  src: string
  /** HTTP-friendly profile name used in the video delivery path. */
  profile: string
  /** Container format from Amplience, for example `mpeg4` or `webm`. */
  format?: string
  /** Used to order sources highest-first. */
  bitrate?: string
  width?: string
  height?: string
}

/**
 * Amplience Dynamic Media video metadata payload.
 *
 * Returned by `GET /v/{endpoint}/{name}.json`. The `media` array lists every
 * transcode profile that was applied to the asset.
 */
export type AmplienceVideoMetadata = {
  media?: AmplienceVideoMediaProfile[]
}

/** HTML5 `<source>` descriptor built from Amplience metadata. */
export type AmplienceVideoSource = {
  src: string
  type: string
}

/** Maps friendly modifier names to Amplience Dynamic Media query keys. */
const DYNAMIC_MEDIA_PARAM_KEYS: Record<string, string> = {
  width: 'w',
  height: 'h',
  quality: 'qlt',
  format: 'fmt',
}

/**
 * Resolves the media host for Dynamic Media URLs.
 *
 * VSE content responses set `defaultHost` to the staging domain, but browser image
 * requests cannot attach VSE authorization headers. Published assets are served from
 * the production CDN, so staging hosts are rewritten for preview and visualization.
 *
 * @param defaultHost - Host from the Amplience image-link object
 * @returns Hostname to use when building the image URL
 */
export const resolveAmplienceMediaHost = (defaultHost: string): string => {
  if (defaultHost.includes('staging.bigcontent.io')) {
    return AMPLIENCE_PRODUCTION_MEDIA_HOST
  }

  return defaultHost
}

/**
 * Builds Dynamic Media transform query parameters from friendly modifier names.
 *
 * Defaults `fmt=auto` and `qlt=default`, then maps `width`, `height`, `quality`, and
 * `format` to their Dynamic Media keys. Unknown keys pass through unchanged, and
 * `undefined`/`null` values are skipped.
 *
 * @param modifiers - Transform modifiers keyed by friendly name
 * @returns Query parameters ready to append to a Dynamic Media URL
 */
export const buildDynamicMediaParams = (
  modifiers: Record<string, string | number | undefined | null> = {},
): URLSearchParams => {
  const params = new URLSearchParams({ fmt: 'auto', qlt: 'default' })

  for (const [key, value] of Object.entries(modifiers)) {
    if (value === undefined || value === null) {
      continue
    }
    params.set(DYNAMIC_MEDIA_PARAM_KEYS[key] ?? key, String(value))
  }

  return params
}

/**
 * Builds a Dynamic Media URL from an Amplience image link object.
 *
 * @param imageLink - Amplience image link with host, endpoint, and name
 * @param modifiers - Optional transform parameters
 * @returns Full HTTPS URL for the image asset
 */
export const buildAmplienceImageUrl = (
  imageLink: { defaultHost: string; endpoint: string; name: string },
  modifiers: { width?: number; format?: string; quality?: string } = {},
): string => {
  const params = buildDynamicMediaParams({
    format: modifiers.format ?? 'auto',
    quality: modifiers.quality ?? 'default',
    width: modifiers.width,
  })

  const host = resolveAmplienceMediaHost(imageLink.defaultHost)

  return `https://${host}/i/${imageLink.endpoint}/${imageLink.name}?${params.toString()}`
}

/**
 * Builds a Dynamic Media URL from an Amplience video link object.
 *
 * Without a profile, Amplience returns the video's poster frame (or the first
 * frame), not a playable stream. Pass a transcode profile such as `mp4_720p`
 * for a playable video URL. Profiled URLs append `protocol=https` so the stream
 * is served over HTTPS on HTTPS pages.
 *
 * @param videoLink - Amplience video link with host, endpoint, and name
 * @param profile - Optional transcode profile name (for example `mp4_720p`)
 * @returns Full HTTPS URL for the poster frame or profiled video stream
 *
 * @see https://amplience.com/developers/docs/apis/media-delivery/media-delivery-reference/#video
 */
export const buildAmplienceVideoUrl = (
  videoLink: AmplienceVideoLink,
  profile?: string,
): string => {
  const host = resolveAmplienceMediaHost(videoLink.defaultHost)
  const base = `https://${host}/v/${videoLink.endpoint}/${videoLink.name}`

  if (!profile) {
    return base
  }

  return `${base}/${profile}?protocol=https`
}

/**
 * Builds the Amplience video metadata URL for a video-link.
 *
 * The `.json` response lists every applied transcode profile for the asset.
 *
 * @param videoLink - Amplience video link with host, endpoint, and name
 * @returns Full HTTPS URL for the video metadata document
 */
export const buildAmplienceVideoMetadataUrl = (
  videoLink: AmplienceVideoLink,
): string => {
  const host = resolveAmplienceMediaHost(videoLink.defaultHost)
  return `https://${host}/v/${videoLink.endpoint}/${videoLink.name}.json`
}

/**
 * Maps an Amplience video container format to an HTML5 MIME type.
 *
 * @param format - Format from metadata (`mpeg4`, `webm`, …)
 * @returns MIME type for a `<source type>` attribute
 */
export const resolveAmplienceVideoMimeType = (format?: string): string => {
  switch (format?.toLowerCase()) {
    case 'webm':
      return 'video/webm'
    case 'mpeg4':
    case 'mp4':
    default:
      return 'video/mp4'
  }
}

/**
 * Builds `<source>` entries from Amplience video metadata.
 *
 * Uses the profiles Amplience actually applied to the asset, ordered by bitrate
 * (highest first). Delivery URLs are rebuilt with HTTPS + `protocol=https`
 * instead of reusing the often-`http` `src` values from the metadata payload.
 *
 * @param videoLink - Amplience video link with host, endpoint, and name
 * @param metadata - Metadata payload from `/v/{endpoint}/{name}.json`
 * @returns Source descriptors for an HTML5 `<video>` element
 */
export const buildAmplienceVideoSourcesFromMetadata = (
  videoLink: AmplienceVideoLink,
  metadata: AmplienceVideoMetadata,
): AmplienceVideoSource[] => {
  const profiles = [...(metadata.media ?? [])]
    .filter((item) => Boolean(item.profile))
    .sort((a, b) => Number(b.bitrate ?? 0) - Number(a.bitrate ?? 0))

  return profiles.map((item) => ({
    src: buildAmplienceVideoUrl(videoLink, item.profile),
    type: resolveAmplienceVideoMimeType(item.format),
  }))
}

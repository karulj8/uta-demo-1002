import { describe, expect, it } from 'vitest'
import {
  AMPLIENCE_PRODUCTION_MEDIA_HOST,
  buildAmplienceImageUrl,
  buildAmplienceVideoMetadataUrl,
  buildAmplienceVideoSourcesFromMetadata,
  buildAmplienceVideoUrl,
  resolveAmplienceMediaHost,
  resolveAmplienceVideoMimeType,
} from './media'

describe('Amplience media helpers', () => {
  it('builds Dynamic Media URLs', () => {
    const url = buildAmplienceImageUrl({
      defaultHost: 'cdn.media.amplience.net',
      endpoint: 'test',
      name: 'image',
    })

    expect(url).toContain('cdn.media.amplience.net/i/test/image')
    expect(url).toContain('fmt=auto')
  })

  it('applies width, format, and quality modifiers', () => {
    const url = buildAmplienceImageUrl(
      {
        defaultHost: 'cdn.media.amplience.net',
        endpoint: 'test',
        name: 'image',
      },
      { width: 800, format: 'webp', quality: '80' },
    )

    expect(url).toContain('w=800')
    expect(url).toContain('fmt=webp')
    expect(url).toContain('qlt=80')
  })

  it('rewrites staging hosts to the production media host', () => {
    expect(resolveAmplienceMediaHost('abc123.staging.bigcontent.io')).toBe(
      AMPLIENCE_PRODUCTION_MEDIA_HOST,
    )

    const url = buildAmplienceImageUrl({
      defaultHost: 'abc123.staging.bigcontent.io',
      endpoint: 'test',
      name: 'image',
    })
    expect(url).toContain(`${AMPLIENCE_PRODUCTION_MEDIA_HOST}/i/test/image`)
  })

  it('leaves non-staging hosts untouched', () => {
    expect(resolveAmplienceMediaHost('cdn.media.amplience.net')).toBe(
      'cdn.media.amplience.net',
    )
  })

  it('builds an unprofiled video URL for the poster frame', () => {
    const url = buildAmplienceVideoUrl({
      defaultHost: 'cdn.media.amplience.net',
      endpoint: 'test',
      name: 'hero-video',
    })

    expect(url).toBe('https://cdn.media.amplience.net/v/test/hero-video')
  })

  it('builds a profiled video URL with HTTPS protocol', () => {
    const url = buildAmplienceVideoUrl(
      {
        defaultHost: 'cdn.media.amplience.net',
        endpoint: 'test',
        name: 'hero-video',
      },
      'mp4_720p',
    )

    expect(url).toBe(
      'https://cdn.media.amplience.net/v/test/hero-video/mp4_720p?protocol=https',
    )
  })

  it('rewrites staging hosts for video URLs', () => {
    const url = buildAmplienceVideoUrl(
      {
        defaultHost: 'abc123.staging.bigcontent.io',
        endpoint: 'test',
        name: 'hero-video',
      },
      'mp4_480p',
    )

    expect(url).toBe(
      `https://${AMPLIENCE_PRODUCTION_MEDIA_HOST}/v/test/hero-video/mp4_480p?protocol=https`,
    )
  })

  it('builds the video metadata URL', () => {
    const url = buildAmplienceVideoMetadataUrl({
      defaultHost: 'cdn.media.amplience.net',
      endpoint: 'test',
      name: 'hero-video',
    })

    expect(url).toBe('https://cdn.media.amplience.net/v/test/hero-video.json')
  })

  it('maps Amplience formats to MIME types', () => {
    expect(resolveAmplienceVideoMimeType('mpeg4')).toBe('video/mp4')
    expect(resolveAmplienceVideoMimeType('webm')).toBe('video/webm')
    expect(resolveAmplienceVideoMimeType(undefined)).toBe('video/mp4')
  })

  it('builds video sources from metadata ordered by bitrate', () => {
    const sources = buildAmplienceVideoSourcesFromMetadata(
      {
        defaultHost: 'cdn.media.amplience.net',
        endpoint: 'test',
        name: 'hero-video',
      },
      {
        media: [
          {
            src: 'https://cdn.media.amplience.net/v/test/hero-video/mp4_240p',
            profile: 'mp4_240p',
            format: 'mpeg4',
            bitrate: '328',
          },
          {
            src: 'https://cdn.media.amplience.net/v/test/hero-video/webm720p',
            profile: 'webm720p',
            format: 'webm',
            bitrate: '1910',
          },
          {
            src: 'https://cdn.media.amplience.net/v/test/hero-video/mp4_720p',
            profile: 'mp4_720p',
            format: 'mpeg4',
            bitrate: '2020',
          },
        ],
      },
    )

    expect(sources).toEqual([
      {
        src: 'https://cdn.media.amplience.net/v/test/hero-video/mp4_720p?protocol=https',
        type: 'video/mp4',
      },
      {
        src: 'https://cdn.media.amplience.net/v/test/hero-video/webm720p?protocol=https',
        type: 'video/webm',
      },
      {
        src: 'https://cdn.media.amplience.net/v/test/hero-video/mp4_240p?protocol=https',
        type: 'video/mp4',
      },
    ])
  })
})

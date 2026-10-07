import { joinURL } from 'ufo'
import type { ImageModifiers } from '@nuxt/image'
import { defineProvider } from '@nuxt/image/runtime'
import {
  buildDynamicMediaParams,
  resolveAmplienceMediaHost,
} from '../../utils/media'

interface AmplienceModifiers extends ImageModifiers {
  defaultHost?: string
  endpoint?: string
  name?: string
}

export default defineProvider<AmplienceModifiers>({
  getImage: (
    src: string,
    {
      modifiers = {},
      baseURL = '/',
    }: { modifiers?: Partial<AmplienceModifiers>; baseURL?: string } = {},
  ) => {
    const { defaultHost, endpoint, name, ...imageModifiers } =
      modifiers as AmplienceModifiers

    let url: URL

    if (defaultHost && endpoint && name) {
      url = new URL(
        `https://${resolveAmplienceMediaHost(defaultHost)}/i/${endpoint}/${name}`,
      )
    } else if (src.startsWith('http://') || src.startsWith('https://')) {
      url = new URL(src)
    } else {
      url = new URL(joinURL(baseURL, src))
    }

    const operations = buildDynamicMediaParams(
      imageModifiers as Record<string, string | number>,
    )

    for (const [key, value] of operations) {
      url.searchParams.set(key, value)
    }

    return {
      url: url.toString(),
    }
  },
})

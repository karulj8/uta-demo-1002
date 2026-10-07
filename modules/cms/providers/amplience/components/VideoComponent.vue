<template>
  <div
    :data-amplience-entry-id="contentElement._meta?.deliveryId"
    data-amplience-field-id="video"
    class="flex aspect-[--aspect-ratio] w-full items-center justify-center overflow-hidden object-bottom"
    :style="cssVars"
  >
    <div
      v-if="!showVideoPlayer"
      class="relative m-auto flex size-full items-center justify-center"
    >
      <picture v-if="posterSources.length">
        <template v-for="(source, index) of posterSources">
          <source
            v-if="index + 1 < posterSources.length"
            :key="source.src"
            :type="source.type"
            :sizes="source.sizes"
            :srcset="source.srcset"
            :media="source.media"
          />
          <template v-else>
            <img
              ref="imgEl"
              :key="'last' + source.src"
              class="size-full object-cover object-center"
              :src="source.src"
              :sizes="source.sizes"
              :srcset="source.srcset"
              alt=""
            />
          </template>
        </template>
      </picture>
      <img
        v-else-if="videoPosterUrl"
        class="size-full object-cover object-center"
        :src="videoPosterUrl"
        alt=""
      />
      <SFButton
        v-if="sourcesReady && !(contentElement.autoplay ?? true)"
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-label="Play video"
        title="Play video"
        @click="startVideo"
      >
        ▶
      </SFButton>
    </div>
    <video
      v-else
      ref="videoEl"
      playsinline
      :poster="videoPosterUrl"
      :autoplay="contentElement.autoplay ?? true"
      :controls="contentElement.controls ?? false"
      :loop="contentElement.loop ?? true"
      :muted="contentElement.muted ?? true"
      class="m-auto size-full max-h-full max-w-full object-contain"
    >
      <source
        v-for="source in videoSources"
        :key="source.src"
        :src="source.src"
        :type="source.type"
      />
    </video>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import type { VideoComponent } from '../types/gen'
import {
  buildAmplienceImageUrl,
  buildAmplienceVideoMetadataUrl,
  buildAmplienceVideoSourcesFromMetadata,
  buildAmplienceVideoUrl,
  type AmplienceVideoMetadata,
} from '../utils/media'
import SFButton from '~~/modules/ui/runtime/components/core/SFButton.vue'
import { getImageSources, type Source } from '~~/modules/cms/utils/image'
import { useImage } from '#imports'
import { useAsyncData } from '#app/composables/asyncData'
import { useRuntimeConfig } from '#app/nuxt'
import { useLog } from '#storefront/composables'

const { contentElement } = defineProps<{ contentElement: VideoComponent }>()

const log = useLog('Amplience')
const playing = ref(false)
const videoEl = useTemplateRef('videoEl')

/**
 * Amplience poster frame from the unprofiled video URL.
 *
 * Shown while metadata is loading, when autoplay is off, and as the
 * `<video poster>` attribute once playback starts.
 */
const videoPosterUrl = computed(() => {
  if (!contentElement.video) {
    return undefined
  }

  return buildAmplienceVideoUrl(contentElement.video)
})

const metadataKey = computed(() => {
  const video = contentElement.video
  if (!video) {
    return 'amplience-video-meta:empty'
  }

  return `amplience-video-meta:${video.endpoint}:${video.name}`
})

const { data: videoMetadata } = useAsyncData(
  metadataKey,
  async (): Promise<AmplienceVideoMetadata | null> => {
    if (!contentElement.video) {
      return null
    }

    try {
      return await $fetch<AmplienceVideoMetadata>(
        buildAmplienceVideoMetadataUrl(contentElement.video),
      )
    } catch (error) {
      log.warn(
        `CMS: Amplience video metadata fetch failed for "${contentElement.video.endpoint}/${contentElement.video.name}"`,
        error,
      )
      return null
    }
  },
  {
    lazy: true,
    watch: [metadataKey],
    default: () => null,
  },
)

/**
 * Profiled video sources from Amplience metadata.
 *
 * Empty until `/v/{endpoint}/{name}.json` resolves. Amplience only returns a
 * playable stream when a transcode profile is in the URL path.
 */
const videoSources = computed(() => {
  if (!contentElement.video || !videoMetadata.value) {
    return []
  }

  return buildAmplienceVideoSourcesFromMetadata(
    contentElement.video,
    videoMetadata.value,
  )
})

const sourcesReady = computed(() => videoSources.value.length > 0)
const showVideoPlayer = computed(() => playing.value && sourcesReady.value)

const startVideo = async () => {
  if (!sourcesReady.value) {
    return
  }

  playing.value = true
  await nextTick()
  videoEl.value?.play()
}

watch(
  sourcesReady,
  async (ready) => {
    if (ready && (contentElement.autoplay ?? true)) {
      await startVideo()
    }
  },
  { immediate: true },
)

const cssVars = computed(() => {
  switch (contentElement.aspect_ratio) {
    case '1:1':
      return {
        '--aspect-ratio': '1/1',
      }
    case '4:3':
      return {
        '--aspect-ratio': '4/3',
      }
    case '16:9':
    default:
      return {
        '--aspect-ratio': '16/9',
      }
  }
})

const { breakpoints } = useRuntimeConfig().public.storefrontUI
const $img = useImage()

const posterSources = computed<Source[]>(() => {
  const posterImageDesktop = contentElement.poster_image
  if (!posterImageDesktop) {
    return []
  }

  const posterImageMobile =
    contentElement.poster_image_mobile ?? posterImageDesktop
  const desktopUrl = buildAmplienceImageUrl(posterImageDesktop)
  const mobileUrl = buildAmplienceImageUrl(posterImageMobile)

  return getImageSources(
    desktopUrl,
    mobileUrl,
    breakpoints.lg as number,
    'amplience',
    $img,
  )
})
</script>

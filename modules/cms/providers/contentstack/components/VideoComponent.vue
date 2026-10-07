<template>
  <div
    v-live-preview="contentElement"
    class="flex aspect-[--aspect-ratio] w-full items-center justify-center overflow-hidden object-bottom"
    :style="cssVars"
  >
    <div
      v-if="!playing"
      class="relative m-auto flex size-full items-center justify-center"
    >
      <picture>
        <template v-for="(source, index) of previewImageSources">
          <source
            v-if="index + 1 < previewImageSources.length"
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
              :alt="contentElement.video?.title ?? ''"
            />
          </template>
        </template>
      </picture>
      <SFButton
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
      :src="contentElement.video.url"
      :autoplay="contentElement.autoplay ?? true"
      :controls="contentElement.show_controls"
      :loop="contentElement.loop ?? true"
      :muted="contentElement.muted ?? true"
      class="m-auto size-full max-h-full max-w-full object-contain"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue'
import { vLivePreview } from '../directives/livePreview'
import type { VideoComponent } from '../types/gen/contentstack'
import SFButton from '~~/modules/ui/runtime/components/core/SFButton.vue'
import { getImageSources, type Source } from '~~/modules/cms/utils/image'
import { useImage } from '#imports'
import { useRuntimeConfig } from '#app/nuxt'

const { contentElement } = defineProps<{ contentElement: VideoComponent }>()

const playing = ref(contentElement.autoplay ?? true)
const videoEl = useTemplateRef('videoEl')

const startVideo = async () => {
  playing.value = true
  await nextTick()
  videoEl.value?.play()
}

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

const previewImageSources = computed<Source[]>(() => {
  const desktopUrl = contentElement.previewimagedesktop.url
  return getImageSources(
    desktopUrl,
    contentElement?.previewimagemobile?.url || desktopUrl,
    breakpoints.lg as number,
    'contentstack',
    $img,
  )
})
</script>

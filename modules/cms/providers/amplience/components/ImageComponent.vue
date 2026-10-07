<template>
  <div
    :data-amplience-entry-id="contentElement._meta?.deliveryId"
    data-amplience-field-id="image_desktop"
    class="aspect-[--mobile-aspect-ratio] max-h-[--mobile-max-height] max-w-[--mobile-max-width] overflow-hidden lg:aspect-[--desktop-aspect-ratio] lg:max-h-[--desktop-max-height] lg:max-w-[--desktop-max-width]"
    :style="cssVars"
    v-bind="$attrs"
  >
    <picture>
      <template v-for="(source, index) of sources">
        <source
          v-if="index + 1 < sources.length"
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
            :alt="contentElement.alt_text ?? ''"
            :src="source.src"
            :sizes="source.sizes"
            :srcset="source.srcset"
          />
        </template>
      </template>
    </picture>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCMSContext } from '../../../utils/useCMSContext'
import type { ImageComponent } from '../types/gen'
import { buildAmplienceImageUrl } from '../utils/media'
import { useImage } from '#imports'
import { useRuntimeConfig } from '#app/nuxt'
import {
  getImageSizes,
  getImageSources,
  type Source,
} from '~~/modules/cms/utils/image'

const { contentElement } = defineProps<{
  contentElement: ImageComponent
}>()

const getAspectRatio = (
  aspectRatio:
    | ImageComponent['aspect_ratio_desktop']
    | ImageComponent['aspect_ratio_mobile'] = 'original',
) => {
  switch (aspectRatio) {
    case '16:9':
      return '16/9'
    case '1:1':
      return '1/1'
    case '4:3':
      return '4/3'
    case '3:4':
      return '3/4'
    case 'original':
    default:
      return 'auto'
  }
}

const { breakpoints } = useRuntimeConfig().public.storefrontUI
const $img = useImage()

const { desktopViewportFraction, mobileViewportFraction, maxWidths } =
  useCMSContext()

const sources = computed<Source[]>(() => {
  const desktopImage = contentElement.image_desktop
  if (!desktopImage) {
    return []
  }

  const mobileImage = contentElement.image_mobile ?? desktopImage
  const desktopUrl = buildAmplienceImageUrl(desktopImage)
  const mobileUrl = buildAmplienceImageUrl(mobileImage)

  return getImageSources(
    desktopUrl,
    mobileUrl,
    breakpoints.lg as number,
    'amplience',
    $img,
    getImageSizes(
      desktopViewportFraction.value,
      mobileViewportFraction.value,
      maxWidths,
    ),
  )
})

const cssVars = computed(() => ({
  '--mobile-aspect-ratio': getAspectRatio(contentElement.aspect_ratio_mobile),
  '--desktop-aspect-ratio': getAspectRatio(contentElement.aspect_ratio_desktop),
  '--desktop-max-height': 'none',
  '--desktop-max-width': 'none',
  '--mobile-max-height': 'none',
  '--mobile-max-width': 'none',
}))
</script>

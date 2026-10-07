<template>
  <div
    v-live-preview="contentElement"
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
            :alt="contentElement.alt_text"
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
import { vLivePreview } from '../directives/livePreview'
import { useCMSContext } from '../../../utils/useCMSContext'
import type { ImageComponent, File } from '../types/gen/contentstack'
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

const getImageDimensions = (image?: File | null) => {
  if (!image?.dimension) {
    return {
      width: 0,
      height: 0,
    }
  }
  return {
    width: image.dimension.width,
    height: image.dimension.height,
  }
}

const getAspectRatio = (
  aspectRatio:
    | ImageComponent['aspect_ratio_desktop']
    | ImageComponent['aspect_ratio_mobile'] = 'original',
  image?: File | null,
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
    default: {
      const { width, height } = getImageDimensions(image)
      if (!width || !height) {
        return 'auto'
      }

      return `${width}/${height}`
    }
  }
}

const { breakpoints } = useRuntimeConfig().public.storefrontUI
const $img = useImage()

const { desktopViewportFraction, mobileViewportFraction, maxWidths } =
  useCMSContext()

const sources = computed<Source[]>(() => {
  return getImageSources(
    contentElement.image_desktop.url,
    contentElement?.image_mobile?.url || contentElement.image_desktop.url,
    breakpoints.lg as number,
    'contentstack',
    $img,
    getImageSizes(
      desktopViewportFraction.value,
      mobileViewportFraction.value,
      maxWidths,
    ),
  )
})

// Create CSS custom properties for dynamic styling
const cssVars = computed(() => {
  const mobileAspectRatio = getAspectRatio(
    contentElement?.aspect_ratio_mobile,
    contentElement?.image_mobile || contentElement.image_desktop,
  )
  const desktopAspectRatio = getAspectRatio(
    contentElement?.aspect_ratio_desktop,
    contentElement?.image_desktop,
  )
  const mobileDimensions = getImageDimensions(
    contentElement?.image_mobile || contentElement.image_desktop,
  )
  const desktopDimensions = getImageDimensions(contentElement?.image_desktop)
  return {
    '--mobile-aspect-ratio': mobileAspectRatio,
    '--desktop-aspect-ratio': desktopAspectRatio,
    '--desktop-max-height': `${desktopDimensions.height}px`,
    '--desktop-max-width': `${desktopDimensions.width}px`,
    '--mobile-max-height': `${mobileDimensions.height}px`,
    '--mobile-max-width': `${mobileDimensions.width}px`,
  }
})
</script>

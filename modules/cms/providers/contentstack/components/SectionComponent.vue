<template>
  <section
    v-live-preview="contentElement"
    class="stack relative min-h-[var(--min-height-mobile)] w-full overflow-hidden lg:min-h-[var(--min-height-desktop)]"
    :style="{
      '--min-height-desktop': minHeightDesktop,
      '--min-height-mobile': minHeightMobile,
      'background-color': !!contentElement.background_color
        ? contentElement.background_color
        : undefined,
    }"
  >
    <picture
      v-if="
        contentElement.background_image_desktop?.url ||
        contentElement.background_image_mobile?.url
      "
      class="absolute size-full object-cover object-center"
    >
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
            :src="source.src"
            :sizes="source.sizes"
            :srcset="source.srcset"
            role="presentation"
            alt=""
          />
        </template>
      </template>
    </picture>

    <div
      class="z-10 flex size-full flex-col overflow-hidden"
      :class="[paddingClasses, horizontalContentAlignment]"
    >
      <ContentstackComponent
        v-for="(element, index) in contentElement.content"
        :key="element.uid"
        v-live-preview:[`content__${index}`].loop="contentElement"
        :content-element="element"
        :class="{
          'mt-auto': shouldAddTopMargin(index),
          'mb-auto': shouldAddBottomMargin(index),
        }"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { vLivePreview } from '../directives/livePreview'
import { useCMSContext } from '../../../utils/useCMSContext'
import type { SectionComponent } from '../types/gen/contentstack'
import ContentstackComponent from './ContentstackComponent.vue'
import { useImage } from '#imports'
import { useRuntimeConfig } from '#app/nuxt'
import {
  getImageSizes,
  getImageSources,
  type Source,
} from '~~/modules/cms/utils/image'

const { contentElement } = defineProps<{
  contentElement: SectionComponent
}>()

const paddingClasses = computed(() => {
  switch (contentElement?.padding) {
    case 'small':
      return 'p-3 lg:p-5'
    case 'medium':
      return 'p-5 lg:p-9'
    case 'large':
      return 'p-9 lg:p-12'
    case 'none':
    default:
      return 'p-0'
  }
})

const $img = useImage()

const minHeightDesktop = computed(() => {
  return `${contentElement?.min_height_desktop || 0}px`
})
const minHeightMobile = computed(() => {
  return `${contentElement?.min_height_mobile || contentElement?.min_height_desktop || 0}px`
})

const horizontalContentAlignment = computed(() => {
  switch (contentElement.horizontal_content_alignment) {
    case 'Left':
      return 'items-start'
    case 'Right':
      return 'items-end'
    case 'Center':
    default:
      return 'items-center'
  }
})

const shouldAddTopMargin = (index: number) => {
  return (
    index === 0 &&
    ['Bottom', 'Middle'].includes(
      contentElement.vertical_content_alignment || 'Middle',
    )
  )
}

const shouldAddBottomMargin = (index: number) => {
  return (
    index === (contentElement?.content?.length ?? 0) - 1 &&
    ['Top', 'Middle'].includes(
      contentElement.vertical_content_alignment || 'Middle',
    )
  )
}

const { desktopViewportFraction, mobileViewportFraction, maxWidths } =
  useCMSContext()
const { breakpoints } = useRuntimeConfig().public.storefrontUI

const sources = computed<Source[]>(() => {
  const desktopUrl = contentElement.background_image_desktop?.url
  if (!desktopUrl) {
    return []
  }

  return getImageSources(
    desktopUrl,
    contentElement?.background_image_mobile?.url || desktopUrl,
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
</script>
<style scoped>
.stack {
  display: grid;
  grid-template-areas: 'stack';
}
.stack > * {
  grid-area: stack;
}
</style>

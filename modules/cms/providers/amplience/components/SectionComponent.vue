<template>
  <section
    :data-amplience-entry-id="contentElement._meta?.deliveryId"
    data-amplience-field-id="content"
    class="stack relative min-h-[var(--min-height-mobile)] w-full overflow-hidden lg:min-h-[var(--min-height-desktop)]"
    :style="sectionStyle"
  >
    <picture
      v-if="desktopBackgroundUrl || mobileBackgroundUrl"
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
      <AmplienceComponent
        v-for="(element, index) in contentElement.content ?? []"
        :key="index"
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
import { useCMSContext } from '../../../utils/useCMSContext'
import type { SectionComponent } from '../types/gen'
import { buildAmplienceImageUrl } from '../utils/media'
import AmplienceComponent from './AmplienceComponent.vue'
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
  switch (contentElement.padding) {
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
    index === (contentElement.content ?? []).length - 1 &&
    ['Top', 'Middle'].includes(
      contentElement.vertical_content_alignment || 'Middle',
    )
  )
}

const { desktopViewportFraction, mobileViewportFraction, maxWidths } =
  useCMSContext()
const { breakpoints } = useRuntimeConfig().public.storefrontUI

const desktopBackgroundUrl = computed(() => {
  const desktopBackground = contentElement.background_image_desktop
  return desktopBackground
    ? buildAmplienceImageUrl(desktopBackground)
    : undefined
})

const mobileBackgroundUrl = computed(() => {
  const mobileBackground =
    contentElement.background_image_mobile ??
    contentElement.background_image_desktop
  return mobileBackground ? buildAmplienceImageUrl(mobileBackground) : undefined
})

const sources = computed<Source[]>(() => {
  if (!desktopBackgroundUrl.value) {
    return []
  }

  return getImageSources(
    desktopBackgroundUrl.value,
    mobileBackgroundUrl.value || desktopBackgroundUrl.value,
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

const sectionStyle = computed(() => ({
  '--min-height-desktop': `${contentElement.min_height_desktop || 0}px`,
  '--min-height-mobile': `${contentElement.min_height_mobile || contentElement.min_height_desktop || 0}px`,
  'background-color': contentElement.background_color || undefined,
}))
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

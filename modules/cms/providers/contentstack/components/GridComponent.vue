<template>
  <div
    v-live-preview="contentElement"
    class="grid w-full"
    :class="[
      desktopColumnsClass,
      desktopColumnGap,
      desktopRowGap,
      mobileColumnsClass,
      mobileColumnGap,
      mobileRowGap,
      verticalContentAlignment,
      horizontalContentAlignment,
    ]"
  >
    <ContentstackComponent
      v-for="(element, index) in contentElement.content"
      :key="element.uid"
      v-live-preview:[`content__${index}`].loop="contentElement"
      :content-element="element"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { vLivePreview } from '../directives/livePreview'
import { provideCMSContext, useCMSContext } from '../../../utils/useCMSContext'
import type { GridComponent } from '../types/gen/contentstack'
import ContentstackComponent from './ContentstackComponent.vue'

const { contentElement } = defineProps<{
  contentElement: GridComponent
}>()

const { desktopViewportFraction, mobileViewportFraction } = useCMSContext()

const desktopProps = computed(() => contentElement.desktop)
const mobileProps = computed(() => contentElement.mobile)

const currentDesktopViewportFraction = computed(() => {
  const cols = desktopProps.value?.number_of_columns_desktop || 1
  return (1 / cols) * desktopViewportFraction.value
})
const currentMobileViewportFraction = computed(() => {
  const cols = mobileProps.value?.number_of_columns_mobile || 1
  return (1 / cols) * mobileViewportFraction.value
})

provideCMSContext({
  desktopViewportFraction: currentDesktopViewportFraction,
  mobileViewportFraction: currentMobileViewportFraction,
})

const desktopColumnsClass = computed(() => {
  const numberOfColumnsDesktop =
    desktopProps.value?.number_of_columns_desktop || 2
  switch (numberOfColumnsDesktop) {
    case 1:
      return 'lg:grid-cols-1'
    case 3:
      return 'lg:grid-cols-3'
    case 4:
      return 'lg:grid-cols-4'
    case 5:
      return 'lg:grid-cols-5'
    case 6:
      return 'lg:grid-cols-6'
    case 2:
    default:
      return 'lg:grid-cols-2'
  }
})

const mobileColumnsClass = computed(() => {
  const numberOfColumnsMobile = mobileProps.value?.number_of_columns_mobile || 1
  switch (numberOfColumnsMobile) {
    case 3:
      return 'grid-cols-3'
    case 2:
      return 'grid-cols-2'
    case 1:
    default:
      return 'grid-cols-1'
  }
})

const desktopColumnGap = computed(() => {
  switch (desktopProps.value?.gap_column_desktop) {
    case 'small':
      return 'lg:gap-x-7'
    case 'medium':
      return 'lg:gap-x-9'
    case 'large':
      return 'lg:gap-x-12'
    case 'none':
    default:
      return 'lg:gap-x-0'
  }
})

const mobileColumnGap = computed(() => {
  switch (mobileProps.value?.gap_column_mobile) {
    case 'small':
      return 'gap-x-3'
    case 'medium':
      return 'gap-x-5'
    case 'large':
      return 'gap-x-9'
    case 'none':
    default:
      return 'gap-x-0'
  }
})

const desktopRowGap = computed(() => {
  switch (desktopProps.value?.gap_row_desktop) {
    case 'small':
      return 'lg:gap-y-7'
    case 'medium':
      return 'lg:gap-y-9'
    case 'large':
      return 'lg:gap-y-12'
    case 'none':
    default:
      return 'lg:gap-y-0'
  }
})

const mobileRowGap = computed(() => {
  switch (mobileProps.value?.gap_row_mobile) {
    case 'small':
      return 'gap-y-3'
    case 'medium':
      return 'gap-y-5'
    case 'large':
      return 'gap-y-9'
    case 'none':
    default:
      return 'gap-y-0'
  }
})

const verticalContentAlignment = computed(() => {
  switch (contentElement.vertical_content_alignment) {
    case 'Top':
      return 'items-start'
    case 'Bottom':
      return 'items-end'
    case 'Middle':
    default:
      return 'items-center'
  }
})
const horizontalContentAlignment = computed(() => {
  switch (contentElement.horizontal_content_alignmen) {
    case 'Left':
      return 'justify-items-start'
    case 'Right':
      return 'justify-items-end'
    case 'Center':
    default:
      return 'justify-items-center'
  }
})
</script>

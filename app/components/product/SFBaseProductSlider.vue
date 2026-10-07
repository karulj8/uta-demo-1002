<template>
  <SFItemsSlider
    ref="sliderRef"
    v-element-visibility="onVisible"
    with-arrows
    mode="horizontal"
    with-skip-links
  >
    <template #header>
      <slot name="header" :title="title">
        <div
          class="mb-6 truncate pr-24 text-2xl font-semibold text-primary md:px-2"
        >
          {{ title }}
        </div>
      </slot>
    </template>
    <template
      #arrows="{ isPrevEnabled, isNextEnabled, prev, next, isScrollable }"
    >
      <slot
        name="arrows"
        v-bind="{ isPrevEnabled, isNextEnabled, prev, next, isScrollable }"
      >
        <div
          class="absolute -top-1 right-6 flex gap-0.5 md:right-2"
          :class="{ hidden: !isScrollable }"
        >
          <SFSliderArrowButton
            tabindex="-1"
            :disabled="!isPrevEnabled"
            direction="left"
            inverted-radius
            :aria-label="$t('slider.got_to_previous_item')"
            @click="prev()"
          />
          <SFSliderArrowButton
            tabindex="-1"
            :disabled="!isNextEnabled"
            direction="right"
            inverted-radius
            :aria-label="$t('slider.got_to_next_item')"
            @click="next()"
          />
        </div>
      </slot>
    </template>
    <template #skip-link-last="{ focusLast, setFocusState, text }">
      <SFButton
        variant="secondary"
        :aria-label="$t('slider.jump_to_end_of_products_a11y')"
        @focus="setFocusState(true)"
        @blur="setFocusState(false)"
        @click="focusLast()"
      >
        {{ text }}
      </SFButton>
    </template>
    <template #skip-link-first="{ focusFirst, setFocusState, text }">
      <SFButton
        variant="secondary"
        :aria-label="$t('slider.jump_to_start_of_products_a11y')"
        @focus="setFocusState(true)"
        @blur="setFocusState(false)"
        @click="focusFirst()"
      >
        {{ text }}
      </SFButton>
    </template>
    <template #default>
      <template v-if="status === 'success'">
        <div
          v-for="(product, index) in products || []"
          :key="product.id"
          class="my-1 w-1/2 shrink-0 snap-start pr-4 md:w-1/3 lg:w-1/4 xl:w-1/5"
        >
          <SFProductCard
            hide-badges
            :campaign="campaign"
            :product="product"
            :multiple-images="isDesktop"
            :images-scrollable="false"
            class="mx-1"
            :tracking-item-list-name="trackingItemListName"
            :product-index="index"
          />
        </div>
      </template>
      <template v-else>
        <SFSkeletonLoader
          v-for="i in 4"
          :key="i"
          class="mx-2 aspect-3/4 w-1/2 shrink-0 md:w-1/3 lg:w-1/4 xl:w-1/5"
          type="custom"
        />
      </template>
    </template>
  </SFItemsSlider>
</template>
<script setup lang="ts">
import type { Product } from '@scayle/storefront-nuxt'
import { useTemplateRef } from 'vue'
import { vElementVisibility } from '@vueuse/components'
import SFProductCard from './card/SFProductCard.vue'
import {
  SFSkeletonLoader,
  SFItemsSlider,
  SFButton,
} from '#storefront-ui/components'
import type { AsyncDataRequestStatus } from '#app'
import SFSliderArrowButton from '~~/modules/ui/runtime/components/core/SFSliderArrowButton.vue'
import { useCampaign } from '#storefront/composables'
import { useDefaultBreakpoints } from '~~/modules/ui/runtime'
import { useProductEvents } from '#tracking/composables'

const { products, title, status, trackingItemListName } = defineProps<{
  title: string
  products: Product[]
  status: AsyncDataRequestStatus
  trackingItemListName?: string
}>()

const { greaterOrEqual } = useDefaultBreakpoints()
const isDesktop = greaterOrEqual('lg')
const { trackViewItemList } = useProductEvents()

const { data: campaign } = useCampaign()

const sliderRef = useTemplateRef('sliderRef')
defineExpose({
  scrollImageIntoView: (index: number) =>
    sliderRef.value?.scrollImageIntoView(index),
})

const onVisible = (isVisible: boolean) => {
  if (!isVisible || !products) {
    return
  }

  trackViewItemList(products, trackingItemListName)
}

defineSlots<{
  /** Header content displayed above the slider */
  header: () => unknown
  /** Custom navigation arrows container with slider state */
  arrows: (props: {
    prev: (offset?: number) => void
    isPrevEnabled: boolean
    next: (offset?: number) => void
    isNextEnabled: boolean
    isScrollable: boolean | undefined
  }) => unknown
}>()
</script>

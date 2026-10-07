<template>
  <SFRecentlyViewedProductsSlider
    :data-contentful-entry-id="contentElement?.sys?.id"
    data-contentful-field-id="padding"
    class="w-full"
    :class="paddingClasses"
    ><template
      #arrows="{ isPrevEnabled, isNextEnabled, prev, next, isScrollable }"
    >
      <div
        class="absolute -top-1 right-6 flex gap-0.5 md:right-2"
        :class="[arrowPadding, { hidden: !isScrollable }]"
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
        /></div></template
  ></SFRecentlyViewedProductsSlider>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { TypeRecentlyViewedProductsComponentWithoutLinkResolutionResponse } from '../types'
import SFRecentlyViewedProductsSlider from '~/components/product/SFRecentlyViewedProductsSlider.vue'
import { useRecentlyViewedProducts } from '#storefront-product-detail/composables'
import SFSliderArrowButton from '~~/modules/ui/runtime/components/core/SFSliderArrowButton.vue'

const { contentElement } = defineProps<{
  contentElement: TypeRecentlyViewedProductsComponentWithoutLinkResolutionResponse
}>()

const { loadMissingProducts } = useRecentlyViewedProducts()

const paddingClasses = computed(() => {
  switch (contentElement.fields.padding) {
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

const arrowPadding = computed(() => {
  switch (contentElement.fields.padding) {
    case 'small':
      return 'pt-3 pr-3 lg:pt-5 lg:pr-5'
    case 'medium':
      return 'pt-5 pr-5 lg:pt-9 lg:pr-9'
    case 'large':
      return 'pt-9 pr-9 lg:pt-12 lg:pr-12'
    case 'none':
    default:
      return 'p-0'
  }
})

onMounted(() => {
  loadMissingProducts()
})
</script>

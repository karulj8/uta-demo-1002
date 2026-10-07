<template>
  <SFBaseProductSlider
    v-if="products.length"
    ref="slider"
    data-testid="recently-viewed-products-slider"
    :products="products"
    :title="$t('recentlyViewedProductsSlider.title')"
    :status="status"
    :slider-tabindex="-1"
    tracking-item-list-name="recently_viewed_slider"
  >
    <template #arrows="slotProps">
      <slot name="arrows" v-bind="slotProps" />
    </template>
  </SFBaseProductSlider>
</template>
<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from 'vue'
import SFBaseProductSlider from './SFBaseProductSlider.vue'
import { useRecentlyViewedProducts } from '#storefront-product-detail/composables'

const { products, status } = useRecentlyViewedProducts()

const sliderRef = useTemplateRef('slider')
watch(products, async () => {
  await nextTick()
  sliderRef.value?.scrollImageIntoView(0)
})

defineSlots<{
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

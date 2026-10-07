<template>
  <SFSmartSortingProductsSlider
    v-live-preview="contentElement"
    :title="contentElement.display_title"
    :smart-sorting-key="smartSortingKey"
    :brand-id="contentElement.brand_id || undefined"
    :category-id="contentElement.category_id || undefined"
    :limit="contentElement.limit || undefined"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SmartSortingKey } from '@scayle/storefront-nuxt'
import { vLivePreview } from '../directives/livePreview'
import type { SmartSortingProductsSliderComponent } from '../types/gen/contentstack'
import SFSmartSortingProductsSlider from '~/components/product/SFSmartSortingProductsSlider.vue'

const { contentElement } = defineProps<{
  contentElement: SmartSortingProductsSliderComponent
}>()

const smartSortingKey = computed(() => {
  return contentElement.smart_sorting_key as SmartSortingKey
})
</script>

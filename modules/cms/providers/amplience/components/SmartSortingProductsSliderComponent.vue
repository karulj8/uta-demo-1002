<template>
  <SFSmartSortingProductsSlider
    :data-amplience-entry-id="contentElement._meta?.deliveryId"
    data-amplience-field-id="category_id"
    :title="contentElement.headline ?? ''"
    :smart-sorting-key="smartSortingKey"
    :category-id="contentElement.category_id || undefined"
    :brand-id="contentElement.brand_id || undefined"
    :limit="contentElement.limit || undefined"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SmartSortingKey } from '@scayle/storefront-nuxt'
import type { SmartSortingProductsSliderComponent } from '../types/gen'
import SFSmartSortingProductsSlider from '~/components/product/SFSmartSortingProductsSlider.vue'

const { contentElement } = defineProps<{
  contentElement: SmartSortingProductsSliderComponent
}>()

const smartSortingKey = computed(
  () =>
    (contentElement.smart_sorting_key ??
      'scayle:v1:topseller') as SmartSortingKey,
)
</script>

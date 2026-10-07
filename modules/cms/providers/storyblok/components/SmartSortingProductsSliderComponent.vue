<template>
  <SFSmartSortingProductsSlider
    v-editable="contentElement"
    :title="contentElement.title"
    :smart-sorting-key="smartSortingKey"
    :brand-id="brandId"
    :category-id="categoryId"
    :limit="limit"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SmartSortingKey } from '@scayle/storefront-nuxt'
import type { SmartSortingProductsSliderComponent } from '../types'
import SFSmartSortingProductsSlider from '~/components/product/SFSmartSortingProductsSlider.vue'

const { contentElement } = defineProps<{
  contentElement: SmartSortingProductsSliderComponent
}>()

const smartSortingKey = computed(() => {
  return contentElement.smartSortingKey as SmartSortingKey
})

const brandId = computed(() => {
  return contentElement.brandId !== undefined
    ? parseInt(contentElement.brandId)
    : undefined
})

const categoryId = computed(() => {
  return contentElement.categoryId !== undefined
    ? parseInt(contentElement.categoryId)
    : undefined
})

const limit = computed(() => {
  return contentElement.limit !== undefined
    ? parseInt(contentElement.limit)
    : undefined
})
</script>

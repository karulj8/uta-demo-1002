<template>
  <SFSmartSortingProductsSlider
    :data-contentful-entry-id="contentElement.sys.id"
    data-contentful-field-id="smartSortingKey"
    :title="contentElement.fields.title"
    :smart-sorting-key="sortingKey"
    :brand-id="contentElement.fields.brandId"
    :category-id="contentElement.fields.categoryId"
    :limit="contentElement.fields.limit"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SmartSortingKey } from '@scayle/storefront-nuxt'
import type { TypeSmartSortingProductsSliderComponentWithoutUnresolvableLinksResponse } from '../types'
import SFSmartSortingProductsSlider from '~/components/product/SFSmartSortingProductsSlider.vue'

const { contentElement } = defineProps<{
  contentElement: TypeSmartSortingProductsSliderComponentWithoutUnresolvableLinksResponse
}>()

// See https://scayle.dev/en/core-documentation/the-basics/products/product-sorting#smart-sorting-2 for all available smart sorting keys.
const SORTING_KEY_MAP = {
  'Sales Push': SmartSortingKey.SALES_PUSH,
  'New Arrivals': SmartSortingKey.NEW_ARRIVALS,
  'Balanced Offerings': SmartSortingKey.BALANCED_OFFERINGS,
  'Inventory Optimization': SmartSortingKey.INVENTORY_OPTIMIZATION,
  'Luxury Promotion': SmartSortingKey.LUXURY_PROMOTION,
  'Stock Coverage': SmartSortingKey.STOCK_COVERAGE,
  Topseller: SmartSortingKey.TOPSELLER,
  'Revenue Max': SmartSortingKey.REVENUE_MAX,
  'Recently Popular': SmartSortingKey.RECENTLY_POPULAR,
  Trending: SmartSortingKey.TRENDING,
} as const

const sortingKey = computed(() => {
  return SORTING_KEY_MAP[contentElement.fields.smartSortingKey]
})
</script>

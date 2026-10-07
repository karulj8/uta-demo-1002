<template>
  <SFBaseProductSlider
    :data-amplience-entry-id="contentElement._meta?.deliveryId"
    data-amplience-field-id="product_ids"
    :title="contentElement.headline ?? ''"
    :products="sortedProducts ?? []"
    :status="status"
    class="w-full"
    :class="{ 'pt-7': !contentElement.headline }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProductSliderComponent } from '../types/gen'
import { useProductsByIds } from '#storefront/composables'
import SFBaseProductSlider from '~/components/product/SFBaseProductSlider.vue'
import { PRODUCT_TILE_WITH_PARAMS } from '#shared/constants'

const { contentElement } = defineProps<{
  contentElement: ProductSliderComponent
}>()

const { data: products, status } = useProductsByIds(
  {
    params: () => {
      return {
        ids: contentElement.product_ids ?? [],
        with: PRODUCT_TILE_WITH_PARAMS,
      }
    },
  },
  `product-slider-${contentElement._meta?.deliveryId ?? 'amplience'}`,
)

const sortedProducts = computed(() => {
  const productIds = contentElement.product_ids ?? []
  return products.value?.toSorted((a, b) => {
    const aIndex = productIds.indexOf(a.id)
    const bIndex = productIds.indexOf(b.id)
    if (aIndex === undefined) {
      return 1
    }
    if (bIndex === undefined) {
      return -1
    }

    return aIndex - bIndex
  })
})
</script>

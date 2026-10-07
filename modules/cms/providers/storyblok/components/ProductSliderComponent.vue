<template>
  <SFBaseProductSlider
    v-editable="contentElement"
    :title="contentElement.title ?? ''"
    :products="sortedProducts ?? []"
    :status="status"
    class="w-full"
    :class="{ 'pt-7': !contentElement.title }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProductSliderComponent } from '../types'
import { useProductsByIds } from '#storefront/composables'
import SFBaseProductSlider from '~/components/product/SFBaseProductSlider.vue'
import { PRODUCT_TILE_WITH_PARAMS } from '#shared/constants'

const { contentElement } = defineProps<{
  contentElement: ProductSliderComponent
}>()
const productIds = computed(() => {
  return (
    ((contentElement?.products || []) as Array<{ id: number }>)?.map(
      (product: { id: number }) => product.id,
    ) ?? []
  )
})

const { data: products, status } = useProductsByIds(
  {
    params: () => {
      return { ids: productIds.value, with: PRODUCT_TILE_WITH_PARAMS }
    },
  },
  `product-slider-${contentElement._uid}`,
)

const sortedProducts = computed(() => {
  return products.value?.toSorted((a, b) => {
    const aIndex = productIds.value.indexOf(a.id)
    const bIndex = productIds.value.indexOf(b.id)
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

<template>
  <SFBaseProductSlider
    :title="contentElement.fields.title ?? ''"
    :products="sortedProducts ?? []"
    :status="status"
    class="w-full"
    :class="{ 'pt-7': !contentElement.fields.title }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TypeProductSliderComponentWithoutUnresolvableLinksResponse } from '../types'
import { useProductsByIds } from '#storefront/composables'
import SFBaseProductSlider from '~/components/product/SFBaseProductSlider.vue'
import { PRODUCT_TILE_WITH_PARAMS } from '#shared/constants'

const { contentElement } = defineProps<{
  contentElement: TypeProductSliderComponentWithoutUnresolvableLinksResponse
}>()

const productIds = computed<number[]>(() => {
  const products = contentElement?.fields?.products
  if (Array.isArray(products)) {
    return (
      products?.reduce<number[]>((acc, product) => {
        if (
          product &&
          typeof product === 'object' &&
          'id' in product &&
          product?.id &&
          typeof product.id === 'number'
        ) {
          return [...acc, product.id]
        }
        return acc
      }, []) ?? []
    )
  }
  return []
})

const { data: products, status } = useProductsByIds(
  {
    params: () => {
      return { ids: productIds.value, with: PRODUCT_TILE_WITH_PARAMS }
    },
  },
  `product-slider-${contentElement.sys.id}`,
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

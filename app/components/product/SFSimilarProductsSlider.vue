<template>
  <SFBaseProductSlider
    v-if="products.length"
    ref="slider"
    data-testid="similar-products-slider"
    :products="products"
    :title="$t('similarProductsSlider.title')"
    :status="status"
    :slider-tabindex="-1"
    tracking-item-list-name="similar_products_slider"
  >
    <template #arrows="slotProps">
      <slot name="arrows" v-bind="slotProps" />
    </template>
  </SFBaseProductSlider>
</template>
<script setup lang="ts">
import { computed, nextTick, toValue, useTemplateRef, watch } from 'vue'
import type { ProductSearchQuery } from '@scayle/storefront-nuxt'
import SFBaseProductSlider from './SFBaseProductSlider.vue'
import { useSimilarProducts } from '#storefront-product-detail/composables'

const { productId, limit, ignoreSameMasterKey, pricePromotionKey, where } =
  defineProps<{
    productId: number
    limit?: number
    ignoreSameMasterKey?: boolean
    pricePromotionKey?: string
    where?: ProductSearchQuery
  }>()

const { data, status } = useSimilarProducts(
  {
    params: () => ({
      productId: toValue(productId),
      limit: toValue(limit),
      ignoreSameMasterKey: toValue(ignoreSameMasterKey),
      pricePromotionKey: toValue(pricePromotionKey),
      where: toValue(where),
    }),
  },
  `similar-products-slider-${productId}`,
)

const sliderRef = useTemplateRef('slider')

const products = computed(() => data.value ?? [])

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

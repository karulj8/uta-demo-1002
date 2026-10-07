<template>
  <SFBaseProductSlider
    :products="products"
    :title="title ?? ''"
    :status="status"
    :slider-tabindex="-1"
    class="w-full"
    :class="{ 'pt-7': !title }"
    :tracking-item-list-name="trackingItemListName"
  />
</template>
<script setup lang="ts">
import { APISortOrder, type SmartSortingKey } from '@scayle/storefront-nuxt'
import { computed } from 'vue'
import SFBaseProductSlider from './SFBaseProductSlider.vue'
import { useProducts } from '#storefront/composables'
import { PRODUCT_TILE_WITH_PARAMS } from '#shared/constants'
import { ATTRIBUTE_KEY_BRAND } from '#shared/constants/attributeKeys'

const {
  smartSortingKey,
  brandId,
  categoryId,
  limit = 10,
  trackingItemListName,
} = defineProps<{
  /**
   * The title of the slider.
   */
  title?: string
  /**
   * The smart sorting key to use.
   *
   * @see https://scayle.dev/en/core-documentation/the-basics/products/product-sorting#smart-sorting-2
   */
  smartSortingKey: SmartSortingKey
  /**
   * The brand id to filter by.
   */
  brandId?: number
  /**
   * The category id to filter by.
   */
  categoryId?: number
  /**
   * The limit of amount of products to show.
   * @defaultValue
   * The default amount of products to show is 10.
   */
  limit?: number
  /**
   * The tracking item list name.
   */
  trackingItemListName?: string
}>()

const { data, status } = useProducts(
  {
    params: () => ({
      sort: { sortingKey: smartSortingKey, direction: APISortOrder.DESCENDING },
      with: PRODUCT_TILE_WITH_PARAMS,
      categoryId,
      where:
        brandId !== undefined
          ? {
              attributes: [
                {
                  type: 'attributes',
                  key: ATTRIBUTE_KEY_BRAND,
                  values: [brandId],
                },
              ],
            }
          : undefined,
      perPage: limit,
    }),
  },
  `smart-sorting-products-slider-${smartSortingKey}-brand:${brandId}-category:${categoryId}-limit:${limit}`,
)

const products = computed(() => {
  return data.value?.products ?? []
})
</script>

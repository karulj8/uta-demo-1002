<template>
  <div class="grid w-full grid-cols-12 gap-4">
    <template v-if="loading">
      <SFProductCardSkeleton
        v-for="index in PRODUCT_CARD_SKELETON_LOADERS_SIZE"
        :key="`product-loading-${index}`"
        type="custom"
      />
    </template>
    <SFProductListNoResults
      v-else-if="!products.length"
      :category="currentCategory?.parent"
      class="col-span-12 max-md:w-fit"
    />
    <template v-else>
      <SFProductCard
        v-for="(product, index) in products"
        :key="`product-${product.id}`"
        class="col-span-6 mb-5 w-full lg:col-span-4 xl:col-span-3"
        data-testid="product-item"
        :product-index="index"
        :product="product"
        :preferred-primary-image-type="preferredPrimaryImageType"
        multiple-images
        :listing-meta-data="categoryListingMetaData"
        :campaign="campaign"
        :tracking-item-list-name="trackingItemListName"
        @intersect:product="onProductIntersects(index)"
      />
      <SFPagination
        v-if="isPaginationShown"
        :total-page-count="pagination?.last ?? 0"
        class="col-span-12 mt-6"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  Product,
  FetchProductsByCategoryResponse,
  Category,
  Value,
} from '@scayle/storefront-nuxt'
import SFProductCardSkeleton from '../product/card/SFProductCardSkeleton.vue'
import SFProductCard from '../product/card/SFProductCard.vue'
import SFProductListNoResults from './SFProductListNoResults.vue'
import { useRowIntersection } from '~/composables'
import {
  PRODUCT_CARD_SKELETON_LOADERS_SIZE,
  categoryListingMetaData,
} from '#shared/constants'
import { SFPagination } from '#storefront-ui/components'
import { useCampaign } from '#storefront/composables'
import { useProductEvents } from '#tracking/composables'

const { trackViewItemList } = useProductEvents()

const {
  loading = true,
  isPaginationVisible = true,
  currentCategory,
  pagination,
  products,
  trackingItemListName,
  trackingSearchTerm,
} = defineProps<{
  /**
   * The products to display.
   */
  products: Product[]
  /**
   * The pagination information.
   */
  pagination?: FetchProductsByCategoryResponse['pagination']
  /**
   * Whether the loading state is visible.
   */
  loading?: boolean
  /**
   * Whether the pagination is visible.
   */
  isPaginationVisible?: boolean
  /**
   * The current category.
   */
  currentCategory?: Category | null
  /**
   * The preferred primary image type.
   */
  preferredPrimaryImageType?: Value
  /**
   * The name of the item list to track.
   */
  trackingItemListName?: string
  /**
   * The search term to track.
   */
  trackingSearchTerm?: string
}>()

const isPaginationShown = computed(() => {
  return pagination && isPaginationVisible && pagination.last > 1
})

const { data: campaign } = useCampaign()

const { collectRowIntersection } = useRowIntersection(() => products)

const onProductIntersects = (index: number) => {
  const collectedRowItems = collectRowIntersection(index)

  if (collectedRowItems) {
    trackViewItemList(
      collectedRowItems.items,
      trackingItemListName,
      trackingSearchTerm,
    )
  }
}
</script>

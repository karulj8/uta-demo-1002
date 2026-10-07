<template>
  <div class="flex flex-wrap" data-testid="mobile-sort-wrapper">
    <SFButton
      v-for="sort in sortOptions"
      :key="sort.key"
      variant="raw"
      :data-testid="`mobile-sort-item-${sort.key}`"
      class="mb-2 mr-2 flex h-10 w-fit items-center justify-center whitespace-pre rounded-full border-2 border-transparent bg-gray-100 px-4 text-md font-semibold text-secondary transition-none"
      :class="{
        '!border-accent bg-white !text-accent': sort.key === selectedSort?.key,
      }"
      @click="applySort(sort)"
    >
      {{ sort.label }}
    </SFButton>
  </div>
</template>

<script setup lang="ts">
import type { SelectedSort } from '@scayle/storefront-product-listing'
import { SFButton } from '#storefront-ui/components'
import { useRouter, useRoute } from '#imports'
import { useFilterEvents } from '#tracking/composables'
import type { TrackingSorting } from '#tracking/types'

const { selectedSort, sortOptions } = defineProps<{
  /**
   * The selected sort option
   */
  selectedSort?: SelectedSort
  /**
   * The available sort options
   */
  sortOptions: SelectedSort[]
}>()

const router = useRouter()
const route = useRoute()
const { trackSorting } = useFilterEvents()

/**
 * Tracks the selected sort option and navigates to the new URL with the new sort option applied.
 * @param sort - The selected sort option
 */
const applySort = (sort: SelectedSort) => {
  trackSorting(sort.key as TrackingSorting)
  router.push({ query: { ...route.query, sort: sort.key } })
}
</script>

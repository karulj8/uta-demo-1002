<template>
  <SFDropdown
    id="sort-selection-dropdown"
    data-testid="sort-dropdown"
    class="h-9 w-full md:w-[12.5rem]"
    :items="sortOptions"
  >
    <template #default>
      <span class="max-w-[80%] overflow-hidden text-ellipsis !text-md">
        {{ selectedSort && selectedSort.label }}
      </span>
    </template>
    <template #item="{ item, selectItem }">
      <SFButton
        variant="raw"
        :data-testid="`sort-item-${item.key}`"
        is-full-width
        class="mb-1 rounded p-2 !text-md !font-semibold text-secondary last-of-type:mb-0 hover:bg-gray-200 enabled:hover:text-secondary"
        :class="{ 'bg-gray-200 !text-primary': item.key === selectedSort?.key }"
        @click="
          () => {
            applySort(item)
            selectItem(item)
          }
        "
      >
        <span class="flex w-full items-center justify-between">
          {{ item.label }}
          <IconCheckmarkDefault
            v-if="item.key === selectedSort?.key"
            class="size-3 fill-accent"
          />
        </span>
      </SFButton>
    </template>
  </SFDropdown>
</template>

<script setup lang="ts">
import type { SelectedSort } from '@scayle/storefront-product-listing'
import { SFButton, SFDropdown } from '#storefront-ui/components'
import { IconCheckmarkDefault } from '#components'
import { useFilterEvents } from '#tracking/composables'
import type { TrackingSorting } from '#tracking/types'
import { useRouter, useRoute } from '#imports'

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

const { trackSorting } = useFilterEvents()
const router = useRouter()
const route = useRoute()

/**
 * Tracks the selected sort option and navigates to the new URL with the new sort option applied.
 * @param sort - The selected sort option
 */
const applySort = (sort: SelectedSort) => {
  trackSorting(sort.key as TrackingSorting)
  router.push({ query: { ...route.query, sort: sort.key } })
}
</script>

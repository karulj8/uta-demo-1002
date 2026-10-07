<template>
  <SFButton
    class="group relative !justify-start rounded-md border border-primary !px-3.5 !py-2 text-md font-semibold max-lg:h-11 max-lg:w-full lg:w-min lg:border-gray-400 lg:bg-gray-100 lg:hover:bg-white"
    data-testid="filter-toggle-button"
    size="sm"
    variant="raw"
    @click="toggleFilter"
  >
    <template #icon="{ _class }">
      <IconUtilityFilter
        class="!size-3 group-hover:fill-accent lg:hidden"
        :class="_class"
      />
    </template>
    {{ label }}
    <span
      v-if="appliedFiltersCount"
      class="right-3 inline-flex size-5 items-center justify-center rounded bg-gray-300 text-sm text-secondary max-lg:absolute max-lg:bg-primary max-lg:text-white lg:size-4"
      data-testid="filter-toggle-counter"
    >
      {{ appliedFiltersCount }}
    </span>

    <template #append-icon="{ _class }">
      <IconUtilityFilter
        class="!size-3 group-hover:fill-accent max-lg:hidden"
        :class="_class"
      />
    </template>
  </SFButton>
</template>

<script setup lang="ts">
import { useSlideIn } from '#storefront-ui'
import { SFButton } from '#storefront-ui/components'
import { useAppliedFilters } from '#storefront-product-listing'
import { useRoute } from '#app/composables/router'
import { IconUtilityFilter } from '#components'

defineProps<{ label: string }>()

const { appliedFiltersCount } = useAppliedFilters(useRoute())

const { toggle: toggleFilter } = useSlideIn('FilterSlideIn')
</script>

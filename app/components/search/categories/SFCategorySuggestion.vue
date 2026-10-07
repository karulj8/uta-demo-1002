<template>
  <SFSearchResultItem
    :to="to"
    @click="$emit('clickResult', categorySuggestion)"
  >
    <div class="space-y-2">
      <div class="flex flex-wrap gap-x-2 text-sm">
        <span
          v-for="({ value }, index) in breadcrumbs"
          :key="value"
          class="space-x-2"
        >
          {{ value }}
          <span v-if="index < breadcrumbs.length - 1">|</span>
        </span>
      </div>
      <div class="text-lg font-bold">
        {{ category.categorySuggestion.category.name }}
      </div>
      <div
        v-if="filters.length"
        class="flex flex-wrap gap-2"
        data-testid="search-suggestion-tag-group"
      >
        <div
          v-for="label in filters"
          :key="label"
          class="flex h-5 items-center rounded-md bg-gray-300 p-1 text-sm leading-none text-secondary"
          :data-testid="`search-suggestion-tag-${label}`"
        >
          {{ label }}
        </div>
      </div>
    </div>
  </SFSearchResultItem>
</template>

<script setup lang="ts">
import type { CategorySearchSuggestion } from '@scayle/storefront-nuxt'
import { computed } from 'vue'
import SFSearchResultItem from '../SFSearchResultItem.vue'
import { useBreadcrumbs, useRouteHelpers } from '~/composables'
import { getSearchFilterLabels } from '#storefront-search/utils'

const { categorySuggestion: category } = defineProps<{
  categorySuggestion: CategorySearchSuggestion
}>()

defineEmits<{ clickResult: [result: CategorySearchSuggestion] }>()

const filters = computed(() => {
  return getSearchFilterLabels(category.categorySuggestion.filters)
})

const { buildCategorySuggestionRoute } = useRouteHelpers()
const to = computed(() => buildCategorySuggestionRoute(category))

const { getBreadcrumbsFromCategory } = useBreadcrumbs()
const breadcrumbs = getBreadcrumbsFromCategory(
  category.categorySuggestion.category,
)
</script>

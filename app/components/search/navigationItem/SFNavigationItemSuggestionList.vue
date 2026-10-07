<template>
  <div class="space-y-3">
    <div class="flex items-center space-x-1 text-md font-semibold text-primary">
      <span>{{ $t('navigation_item_suggestion_list.title') }}</span>
      <span
        class="ml-0.5 inline-flex h-4 items-center rounded-full bg-primary px-2 text-sm leading-none text-gray-100"
      >
        {{ navigationItemSuggestions.length }}
      </span>
    </div>
    <ul class="space-y-2" role="group">
      <li
        v-for="suggestion in navigationItemSuggestions"
        :key="suggestion.navigationItemSuggestion.navigationItem.id"
        role="option"
      >
        <SFNavigationItemSuggestion
          :navigation-item-suggestion="suggestion"
          :search-term="searchTerm"
          raw
          @click-result="$emit('clickResult', suggestion)"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { NavigationItemSuggestion as NavigationItemSuggestionType } from '@scayle/storefront-nuxt'
import SFNavigationItemSuggestion from './SFNavigationItemSuggestion.vue'

defineProps<{
  navigationItemSuggestions: NavigationItemSuggestionType[]
  searchTerm: string
}>()

defineEmits<{ clickResult: [result: NavigationItemSuggestionType] }>()
</script>

<template>
  <section
    ref="root"
    role="search"
    class="relative transition-all duration-150 max-lg:flex"
    :class="{
      'max-lg:px-0 lg:max-w-[475px]': hasFocus,
      'max-lg:px-3 lg:max-w-64': !hasFocus,
    }"
  >
    <form
      ref="searchBox"
      class="w-full"
      aria-haspopup="listbox"
      data-testid="search-form"
      role="search"
      @submit.prevent="goToSearchResolutionOrSearchPage"
    >
      <div
        role="button"
        class="group flex h-11 cursor-pointer items-center gap-2 overflow-hidden border border-gray-200 px-3 transition-all duration-150 max-lg:grow lg:h-10"
        data-testid="search-form-button"
        :class="{
          'bg-white lg:rounded-md': hasFocus,
          'rounded-md bg-gray-200 pr-8 hover:bg-gray-300': !hasFocus,
        }"
        :tabindex="hasFocus ? -1 : 0"
        :aria-label="$t('global.search')"
        @click="openAndFocus"
      >
        <SFButton
          variant="raw"
          tabindex="-1"
          class="flex items-center justify-center max-lg:size-11"
          aria-hidden="true"
        >
          <IconUtilitySearch class="size-4 shrink-0 fill-secondary pr-1" />
        </SFButton>
        <div class="flex h-full min-w-0 grow items-center gap-2">
          <input
            ref="input"
            v-model.trim="searchQuery"
            :tabindex="hasFocus ? 0 : -1"
            type="search"
            aria-controls="search-results"
            aria-autocomplete="list"
            :placeholder="$t('search_input.placeholder')"
            :aria-label="$t('global.search')"
            class="min-w-0 grow bg-gray-200 transition-colors placeholder:text-gray-500 placeholder-shown:truncate focus-visible:shadow-none focus-visible:outline-none"
            data-testid="header-search-input"
            :class="{
              'bg-white': hasFocus,
              'group-hover:bg-gray-300': !hasFocus,
            }"
          />
        </div>
        <SFButton
          ref="resetButton"
          type="reset"
          variant="raw"
          class="h-6 rounded px-1.5 py-1 text-sm leading-5 text-secondary transition duration-150 hover:bg-gray-200 focus:bg-gray-200 focus:px-1.5"
          data-testid="search-reset-button"
          :class="{ hidden: !hasFocus }"
          @click.stop="resetSearch"
          @keydown.enter.stop="resetSearch"
        >
          {{ $t('global.cancel') }}
        </SFButton>
      </div>
    </form>
    <SFSearchResultsContainer
      v-if="searchQuery.length >= 3"
      ref="resultContainer"
      :products="products"
      :categories="categories"
      :navigation-items="navigationItems"
      :search-query="searchQuery"
      :show-suggestions-loader="showSuggestionsLoader"
      @click-result="trackSearchClickAndClose"
      @close="closeAndReset"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, watch, ref } from 'vue'
import {
  onClickOutside,
  onKeyStroke,
  useDebounceFn,
  useEventListener,
} from '@vueuse/core'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import {
  getFirstAttributeValue,
  type SearchEntity,
} from '@scayle/storefront-nuxt'
import { useRouteHelpers } from '~/composables'
import SFSearchResultsContainer from '~/components/search/SFSearchResultsContainer.vue'
import { useSearchInputKeybindings } from '~/composables/useSearchInputKeybindings'
import { SFButton } from '#storefront-ui/components'
import { useSearch } from '#storefront-search/composables/useSearch'
import { DEBOUNCED_SEARCH_DURATION } from '#shared/constants'
import { IconUtilitySearch } from '#components'
import { useSearchEvents } from '#tracking/composables'
import { ATTRIBUTE_KEY_NAME } from '#shared/constants/attributeKeys'

const emit = defineEmits<{
  close: []
  clickResult: [result: SearchEntity | 'show_all']
}>()

const { getSearchRoute, localizedNavigateTo, getSearchSuggestionPath } =
  useRouteHelpers()
const { trackSearch } = useSearchEvents()

const {
  searchQuery,
  getSearchSuggestions,
  resetSearch,
  products,
  categories,
  navigationItems,
  totalCount,
  resolveSearch,
  hasSuggestions,
  status,
} = useSearch()

const debouncedSearch = useDebounceFn(async () => {
  await getSearchSuggestions()
}, DEBOUNCED_SEARCH_DURATION)

const showSuggestionsLoader = computed(() => {
  return (
    status.value === 'pending' && (!searchQuery.value || !hasSuggestions.value)
  )
})

watch(
  () => searchQuery.value,
  async () => {
    await debouncedSearch()
  },
)

const root = ref<HTMLElement>()
const input = ref<HTMLInputElement>()
const resultContainer = ref()
const searchBox = ref<HTMLElement>()
const resetButton = ref<HTMLButtonElement>()
const hasFocus = ref(false)

const openAndFocus = () => {
  input.value?.focus()
  hasFocus.value = true
}

const reset = async () => {
  resetSearch()
  hasFocus.value = false
  await nextTick()
  searchBox.value?.focus()
}

const closeAndReset = async () => {
  await reset()
  emit('close')
}

const trackSearchClickAndClose = (suggestion: SearchEntity | 'show_all') => {
  if (suggestion === 'show_all') {
    trackSearch({
      query: searchQuery.value,
      suggestion,
    })
    closeAndReset()
    return
  }

  trackSearch({
    query: searchQuery.value,
    suggestion,
    query_completed: getQueryCompleted(suggestion),
  })

  closeAndReset()
  emit('clickResult', suggestion)
}

const getQueryCompleted = (resolved: SearchEntity) => {
  switch (resolved.type) {
    case 'category':
      return resolved.categorySuggestion.category.name
    case 'product':
      return (
        getFirstAttributeValue(
          resolved.productSuggestion.product.attributes,
          ATTRIBUTE_KEY_NAME,
        )?.label ?? ''
      )
    case 'navigationItem':
      return resolved.navigationItemSuggestion.navigationItem.name
    default:
      return
  }
}

const goToSearchResolutionOrSearchPage = async () => {
  if (!searchQuery.value) {
    return
  }

  const resolved = await resolveSearch()
  if (resolved?.type) {
    const route = getSearchSuggestionPath(resolved)
    const queryCompleted = getQueryCompleted(resolved)

    if (route) {
      trackSearch({
        query: searchQuery.value,
        query_completed: queryCompleted,
        suggestion: 'show_all',
      })
      await localizedNavigateTo(route)
      closeAndReset()
      return
    }
  }

  const route = getSearchRoute(searchQuery.value)

  trackSearch({
    query: searchQuery.value,
    suggestion: 'show_all',
  })

  await localizedNavigateTo(route)

  closeAndReset()
}

const ARROW_KEYS = ['ArrowUp', 'ArrowDown']

onKeyStroke(
  ARROW_KEYS,
  // Prevent scrolling the page on arrow keys
  (event: KeyboardEvent) => event.preventDefault(),
  { target: root },
)

onClickOutside(root, () => {
  if (!hasFocus.value) {
    return
  }
  reset()
})

const { activate, deactivate } = useFocusTrap(resultContainer, {
  isKeyBackward: (keyEvent) => keyEvent.code === 'ArrowUp',
  isKeyForward: (keyEvent) => keyEvent.code === 'ArrowDown',
  allowOutsideClick: true,
  returnFocusOnDeactivate: false,
})

useEventListener(resultContainer, 'focusin', () => activate())

useSearchInputKeybindings(
  input,
  resultContainer,
  searchBox,
  resetButton,
  hasFocus,
  activate,
  deactivate,
  openAndFocus,
  reset,
  closeAndReset,
  searchQuery,
  totalCount,
)
</script>

/**
 * Debounce duration for search input in milliseconds.
 *
 * @example
 * ```ts
 * // Used in SFSearchInput.vue to debounce search suggestions
 * const debouncedSearch = useDebounceFn(async () => {
 *   await getSearchSuggestions()
 * }, DEBOUNCED_SEARCH_DURATION)
 *
 * watch(
 *   () => searchQuery.value,
 *   async () => {
 *     await debouncedSearch()
 *   },
 * )
 * ```
 */
export const DEBOUNCED_SEARCH_DURATION = 500 // in milliseconds

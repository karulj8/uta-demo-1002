<template>
  <div class="flex flex-col">
    <CMSProductListingPageComponent
      :key="id"
      :category-id="id"
      content-type="teaser"
    />
    <div class="container relative flex bg-white pt-4 max-lg:max-w-none">
      <SFCategorySideNavigation
        v-if="rootCategories?.length"
        class="sticky top-8 h-full max-lg:hidden sm:min-w-40 lg:min-w-64"
        :root-categories="rootCategories"
        :current-category="currentCategory"
        :fetching-categories="fetchingCategories"
      />

      <div class="w-full grow">
        <div class="flex flex-wrap items-center justify-between gap-5">
          <div class="flex items-center">
            <SFCategoryNavigationBackButton
              :current-category="currentCategory"
              class="mr-2 lg:hidden"
              data-testid="plp-back-button"
            />
            <SFCategoryBreadcrumbs
              v-if="currentCategory"
              :loading="productsStatus === 'pending'"
              :category="currentCategory"
              :products-count="totalProductsCount"
            />
          </div>
          <div class="hidden gap-4 lg:flex">
            <SFSortSelection
              class="max-sm:hidden"
              :selected-sort="selectedSort"
              :sort-options="sortingOptions"
            />
            <SFFilterToggleButton :label="$t('filter.show_filter')" />
          </div>
        </div>
        <SFCategoryNavigationSlider
          v-if="rootCategories?.length"
          :all-categories="flattenCategoryTree(rootCategories)"
          :current-category="currentCategory"
          class="mb-3.5 mt-2.5 lg:hidden"
        />
        <SFFilterToggleButton
          class="lg:hidden"
          :label="$t('filter.show_filter_and_sorting')"
        />
        <SFProductList
          :preferred-primary-image-type="primaryImageType"
          :products="products"
          :pagination="pagination"
          :current-category="currentCategory"
          :loading="productsStatus === 'pending'"
          class="mt-6"
          tracking-item-list-name="product_listing"
        />
        <CMSProductListingPageComponent
          v-if="pageNumber === 1"
          :key="id"
          :category-id="id"
          content-type="seo"
        />
      </div>
    </div>
    <SFFilterSlideIn
      :current-category-id="id"
      :selected-sort="selectedSort"
      :sort-options="sortingOptions"
      :selected-primary-image-type="primaryImageType"
      :primary-image-type-options="imageTypeOptions"
    />
    <Teleport to="#teleports">
      <div class="fixed bottom-8 right-4 lg:bottom-24">
        <SFScrollToTopButton />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import type { ResolvableLink } from 'unhead/types'
import type { Category, RFC33339Date, Value } from '@scayle/storefront-nuxt'
import { join } from 'pathe'
import type { SelectedSort } from '@scayle/storefront-product-listing'
import { whenever } from '@vueuse/core'
import { useSeoMeta, useHead, definePageMeta } from '#imports'
import { useI18n, type Locale } from '#i18n'
import { navigateTo, useRoute } from '#app/composables/router'
import { useNuxtApp } from '#app/nuxt'
import {
  useJsonld,
  useBreadcrumbs,
  useRequestOrigin,
  useRouteHelpers,
} from '~/composables'
import { createError } from '#app/composables/error'
import {
  createCacheFriendlyTimestamp,
  getDistinctPrimaryImageTypes,
} from '~/utils'
import { PRODUCT_TILE_WITH_PARAMS, PRODUCTS_PER_PAGE } from '#shared/constants'
import SFCategorySideNavigation from '~/components/category/SFCategorySideNavigation.vue'
import SFCategoryNavigationBackButton from '~/components/category/SFCategoryNavigationBackButton.vue'
import SFCategoryBreadcrumbs from '~/components/category/SFCategoryBreadcrumbs.vue'
import SFSortSelection from '~/components/sorting/SFSortSelection.vue'
import SFFilterToggleButton from '~/components/filter/SFFilterToggleButton.vue'
import SFCategoryNavigationSlider from '~/components/category/SFCategoryNavigationSlider.vue'
import SFProductList from '~/components/productList/SFProductList.vue'
import SFFilterSlideIn from '~/components/filter/SFFilterSlideIn.vue'
import SFScrollToTopButton from '~/components/SFScrollToTopButton.vue'
import {
  useProductListingSeoData,
  useProductsForListing,
  useAppliedFilters,
  useProductListSort,
  useAllShopCategoriesForId,
  generateProductListingHreflangLinks,
  flattenCategoryTree,
  createDefaultSortingOption,
  SORT_DATE_NEWEST,
  SORT_PRICE_DESC,
  SORT_PRICE_ASC,
  SORT_REDUCTION_DESC,
} from '#storefront-product-listing'
import { useCategoryById } from '#storefront/composables'
import { usePrimaryImageType } from '~/composables/usePrimaryImageType'
import CMSProductListingPageComponent from '#storefront-cms/components/ProductListingPageComponent.vue'
import { isInEditorMode } from '#storefront-cms/utils'
import { useGlobalEvents } from '#tracking/composables'

const route = useRoute()
const { $config } = useNuxtApp()
const i18n = useI18n()
const { buildCategoryPath, getLocalizedHref } = useRouteHelpers()

const { trackError } = useGlobalEvents()

// Destructured directly from `defineProps` so the bindings stay reactive. The
// category tree is fetched lazily by the parent `c.vue` and arrives after this
// page has set up, so a one-time copy of the props object would keep serving
// the initial `null`.
const {
  rootCategories,
  fetchingCategories,
  id: routeId,
} = defineProps<{
  rootCategories: Category[]
  fetchingCategories: boolean
  // `props: true` forwards the raw route param, a string, and it can be
  // briefly undefined during navigation. Normalized to a number below.
  id: number | string | undefined
}>()

const id = computed(() => Number(routeId))

const categoryParams = computed(() => ({
  id: id.value,
  children: 0,
  properties: { withName: ['sale'] },
  includeProductSorting: true,
}))

const {
  data: currentCategory,
  status: categoryStatus,
  error: categoryError,
} = await useCategoryById(
  {
    params: categoryParams,
    options: {
      dedupe: 'defer',
      lazy: false,
    },
  },
  'plp-current-category',
)

whenever(
  categoryError,
  (err) => {
    if (isInEditorMode(route)) {
      return
    }
    trackError({
      code: err?.statusCode,
      message: err?.statusMessage ?? 'category_error',
    })
    throw createError({ ...err, fatal: true })
  },
  { immediate: true },
)

/**
 * Validates that the category exists and redirects to the correct path if the URL is incorrect but the category ID is valid
 * @param category - The category to create the expected path for
 */
const validateCategoryExistsAndRedirect = async (category: Category) => {
  // Skip validation in editor mode
  // The contentstack live preview editor will show a popup warning about the redirect when the short url (/c/c-{product-id}) us used.
  // This popup keeps opening even after acknowledging the redirect and proceeding to the new page.
  // To avoid this we skip the validation in editor mode.
  if (isInEditorMode(route)) {
    return
  }
  if (categoryStatus.value == 'pending') {
    return
  }

  // Prevents an infinite redirect loop. Skips redirect if the loaded
  // category's ID does not match the categoryId in the current route.
  if (id.value !== category.id) {
    return
  }

  const expectedPath = buildCategoryPath(category)
  if (expectedPath !== route.path) {
    return navigateTo(
      { path: expectedPath, query: route.query, hash: route.hash },
      { redirectCode: 301 },
    )
  }
}

const sortingOptions = computed<SelectedSort[]>(() => {
  return [
    {
      ...createDefaultSortingOption(currentCategory.value ?? undefined),
      label: i18n.t('sorting_select.top_seller'),
    },
    {
      ...SORT_DATE_NEWEST,
      label: i18n.t('sorting_select.date_newest'),
    },
    {
      ...SORT_PRICE_DESC,
      label: i18n.t('sorting_select.price_desc'),
    },
    {
      ...SORT_PRICE_ASC,
      label: i18n.t('sorting_select.price_asc'),
    },
    {
      ...SORT_REDUCTION_DESC,
      label: i18n.t('sorting_select.reduction_desc'),
    },
  ]
})

const { selectedSort, isDefaultSortSelected } = useProductListSort(route, {
  sortingOptions: sortingOptions,
})
const { appliedFilter } = useAppliedFilters(route)

const imageTypeOptions = computed<Value[]>(() => {
  return getDistinctPrimaryImageTypes(products.value)
})
const { primaryImageType } = usePrimaryImageType(() => imageTypeOptions.value)

const pageNumber = computed(() => Number(route.query.page) || 1)
const params = computed(() => ({
  categoryId: currentCategory.value?.id,
  with: PRODUCT_TILE_WITH_PARAMS,
  sort: selectedSort.value,
  perPage: PRODUCTS_PER_PAGE,
  where: {
    ...appliedFilter.value,
    sellableAt: createCacheFriendlyTimestamp() as RFC33339Date,
  },
  page: pageNumber.value,
}))

const {
  products,
  pagination,
  status: productsStatus,
  totalProductsCount,
} = useProductsForListing({
  params,
})

const shopCategoryParams = computed(() => ({
  id: id.value,
}))

// This request needs to be awaited to have the hreflang links available on server side. Additionally, it needs to be lazy to avoid blocking the page load.
const { data: categoriesForAllShops } = await useAllShopCategoriesForId({
  params: shopCategoryParams,
})

watch(
  [currentCategory, () => route.path],
  async ([category]) => {
    if (!category) {
      return
    }
    await validateCategoryExistsAndRedirect(category)
  },
  { immediate: true },
)

const { getBreadcrumbsFromCategory } = useBreadcrumbs()
const breadcrumbs = computed(() =>
  currentCategory.value
    ? getBreadcrumbsFromCategory(currentCategory.value, true)
    : [],
)

const origin = useRequestOrigin()

const { title, robots, canonicalLink, categoryBreadcrumbSchema } =
  useProductListingSeoData(
    breadcrumbs,
    route,
    () => ({
      baseUrl: origin,
      fullPath: join($config.app.baseURL, route.fullPath),
    }),
    isDefaultSortSelected,
  )

useJsonld(() => categoryBreadcrumbSchema.value)

useSeoMeta({
  robots,
  title: () =>
    pageNumber.value > 1
      ? `${title.value} - ${i18n.t('product_list_page.meta.page', { pageNumber: pageNumber.value })}`
      : title.value,
  description: () => {
    if (!currentCategory.value) {
      return null
    }
    return i18n.t('product_list_page.meta.description', {
      category: currentCategory.value.name,
      shopName: $config.public.shopName,
    })
  },
})

const hreflangLinks = generateProductListingHreflangLinks(
  (categoriesForAllShops.value ?? []).map(({ category, path, locale }) => {
    const localizedCategoryPath = buildCategoryPath(category, path as Locale)
    const href = getLocalizedHref(path as Locale, localizedCategoryPath)
    return {
      categoryHref: href,
      path,
      locale,
    }
  }),
  i18n.defaultLocale,
)

useHead(() => ({
  // The SDK's link objects narrow `rel` to a literal but don't depend on
  // unhead, so their type doesn't structurally match unhead's Link union.
  link: [...canonicalLink.value, ...hreflangLinks] as ResolvableLink[],
}))

defineOptions({ name: 'CategoryPage' })

// The 'key' is required to preserve component state across PLP navigation.
// Without it, components like 'SFCategorySideNavigation' are re-rendered on every route change,
// leading to focus loss and unnecessary performance overhead.
definePageMeta({
  pageType: 'product_listing',
  key: 'PLP',
  props: true,
  validate(route) {
    return typeof route.params.id === 'string' && /^\d+$/.test(route.params.id!)
  },
})
</script>

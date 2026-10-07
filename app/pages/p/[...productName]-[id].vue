<template>
  <SFAsyncStatusWrapper :status="status">
    <div v-if="product" class="xl:container md:pt-4 md:max-xl:mx-5">
      <div
        class="flex flex-col items-start gap-8 max-md:space-y-5 md:flex-row md:justify-start"
      >
        <div
          class="flex items-start max-md:w-full md:sticky md:top-8 md:max-w-[700px] md:shrink"
        >
          <SFProductGallery v-if="product" :product="product" />
        </div>
        <div class="flex w-full flex-col gap-4 md:max-w-[500px] md:shrink-[4]">
          <SFProductBreadcrumbs
            v-if="longestCategoryList"
            class="mb-8 hidden max-md:px-5 md:block"
            :product-categories="longestCategoryList"
          />
          <h1 class="max-md:px-5 md:mb-2">
            <div
              class="truncate font-semibold text-primary"
              :title="brand"
              data-testid="pdp-product-brand"
            >
              {{ brand }}
              <SFHeadline
                size="lg"
                class="text-md !font-normal text-secondary md:text-lg"
                data-testid="pdp-product-name"
              >
                <span class="truncate" :title="name">
                  {{ name }}
                </span>
              </SFHeadline>
            </div>
          </h1>

          <div class="flex flex-col gap-4 max-md:px-5 md:flex-col-reverse">
            <SFProductPrice
              v-if="price"
              size="lg"
              class="mt-3"
              :promotions="promotions"
              :campaign="campaign"
              :price="price"
              :lowest-prior-price="lowestPriorPrice"
              type="normal"
              show-tax-info
              :show-price-from="showFrom"
            />
            <div v-if="campaign || promotions" class="flex flex-col gap-6">
              <SFDealBanner
                v-if="campaign && hasCampaignReduction(price)"
                v-element-visibility="onCampaignVisible"
                :display-data="getCampaignDisplayData(campaign)"
                @track-promotion="trackSelectCampaign(campaign)"
              />
              <!-- NOTE: As there is no limit on the number of promotions, too many `promotions` can cause a crowding effect of deal badges on the image and potentially influence rendering performance. -->
              <SFDealBanner
                v-for="promotion in promotions"
                :key="promotion.id"
                v-element-visibility="onPromotionsVisible"
                :display-data="getPromotionDisplayData(promotion)"
                :is-promotion-applied="isPromotionApplied(promotion)"
                @track-promotion="trackSelectPromotion(promotion)"
              >
                <template #progress>
                  <SFComboDealWrapper
                    v-if="isComboDealType(promotion)"
                    :promotion="promotion"
                  />
                  <SFPromotionProgressWrapper
                    v-else-if="isTieredPromotion(promotion)"
                    :promotion="promotion"
                  />
                </template>
              </SFDealBanner>
            </div>
          </div>

          <SFProductActions
            :active-variant="activeVariant"
            :product="product"
            :promotions="promotions"
            @update:active-variant="updateActiveVariant"
          />

          <SFBuyXGetYProducts
            v-if="buyXGetYPromotion"
            :key="buyXGetYPromotion.id"
            :promotion="buyXGetYPromotion"
            class="max-md:mx-5"
          />

          <SFFadeInTransition>
            <SFStoreVariantAvailability
              v-if="activeVariant?.id"
              class="max-md:mx-5"
              :selected-store-id="selectedStoreId"
              :variant-id="activeVariant.id"
            />
          </SFFadeInTransition>
          <SFLazyStoreLocatorSlideIn
            v-if="activeVariant?.id"
            v-model:selected-store-id="selectedStoreId"
            :variant-id="activeVariant.id"
          />
        </div>
      </div>
      <SFProductDetails :product="product" class="py-10 md:ml-24" />
      <hr v-if="recommendedProductIds.length" class="mb-10 md:hidden" />
      <SFSimilarProductsSlider class="mt-10 max-md:px-5" :product-id="id" />
      <SFSmartSortingProductsSlider
        class="mt-10 max-md:px-5"
        :title="
          $t('product_detail_page.main_category_recommendations', {
            category: category?.categoryName,
          })
        "
        :smart-sorting-key="SmartSortingKey.TRENDING"
        :category-id="category?.categoryId"
        :limit="10"
        tracking-item-list-name="bestsellers_slider"
      />
      <SFRecentlyViewedProductsSlider class="mt-10 max-md:px-5" />
    </div>
    <template #loading>
      <SFProductDetailPageLoadingState />
    </template>
  </SFAsyncStatusWrapper>
</template>

<script setup lang="ts">
import { computed, ref, defineAsyncComponent, onUnmounted, watch } from 'vue'
import type { ResolvableLink } from 'unhead/types'
import { whenever } from '@vueuse/core'
import {
  getFirstAttributeValue,
  SmartSortingKey,
  type Price,
  type Product,
  type Variant,
  type Promotion,
} from '@scayle/storefront-nuxt'
import { join } from 'pathe'
import { vElementVisibility } from '@vueuse/components'
import { clearNuxtData } from '#app/composables/asyncData'
import { useRoute, navigateTo, useRouter } from '#app/composables/router'
import { useSeoMeta, useHead, definePageMeta, useImage } from '#imports'
import { useNuxtApp } from '#app/nuxt'
import { createError } from '#app/composables/error'
import { useJsonld } from '~/composables/useJsonld'
import {
  useCurrentPromotions,
  useBasket,
  useProduct,
  useCampaign,
} from '#storefront/composables'
import {
  getBuyXGetYPromotionForProductDetailPage,
  getPromotionsForProductDetailPage,
  getProductId,
  hasCampaignReduction,
  routeList,
} from '~/utils'
import { useProductBaseInfo } from '~/composables/useProductBaseInfo'
import { useFavoriteStore } from '~/composables/useFavoriteStore'
import { useI18n, useRouteBaseName, type Locale } from '#i18n'
import { PRODUCT_DETAIL_WITH_PARAMS } from '#shared/constants'
import SFAsyncStatusWrapper from '~/components/SFAsyncStatusWrapper.vue'
import SFProductGallery from '~/components/product/detail/productGallery/SFProductGallery.vue'
import SFProductBreadcrumbs from '~/components/product/SFProductBreadcrumbs.vue'
import SFProductPrice from '~/components/product/SFProductPrice.vue'
import SFDealBanner from '~/components/deal/SFDealBanner.vue'
import SFProductActions from '~/components/product/detail/SFProductActions.vue'
import SFStoreVariantAvailability from '~/components/locator/SFStoreVariantAvailability.vue'
import SFProductDetails from '~/components/product/SFProductDetails.vue'
import { SFHeadline, SFFadeInTransition } from '#storefront-ui/components'
import SFProductDetailPageLoadingState from '~/components/product/detail/SFProductDetailPageLoadingState.vue'
import {
  getCombineWithProductIds,
  generateProductHreflangLinks,
  useProductSeoData,
  useAllShopProductsForId,
} from '#storefront-product-detail'
import {
  useBreadcrumbs,
  useRequestOrigin,
  useRouteHelpers,
} from '~/composables'
import { hasSubscriptionCustomData } from '#storefront-subscription/helpers/subscription'
import { generateProductSchema } from '#storefront-product-detail/utils/seo'
import SFBuyXGetYProducts from '~/components/product/promotion/buyXGetY/SFBuyXGetYProducts.vue'
import { useRecentlyViewedProducts } from '#storefront-product-detail/composables'
import SFRecentlyViewedProductsSlider from '~/components/product/SFRecentlyViewedProductsSlider.vue'
import SFPromotionProgressWrapper from '~/components/product/promotion/banners/SFPromotionProgressWrapper.vue'
import SFComboDealWrapper from '~/components/product/promotion/banners/SFComboDealWrapper.vue'
import {
  getCampaignDisplayData,
  getPromotionDisplayData,
  isTieredPromotion,
} from '~/utils/promotion'
import { isComboDealType } from '#storefront-promotions/utils/promotion'
import {
  ATTRIBUTE_KEY_NAME,
  ATTRIBUTE_KEY_SIZE,
} from '#shared/constants/attributeKeys'
import SFSmartSortingProductsSlider from '~/components/product/SFSmartSortingProductsSlider.vue'
import {
  useGlobalEvents,
  usePromotionEvents,
  useProductEvents,
} from '#tracking/composables'
import SFSimilarProductsSlider from '~/components/product/SFSimilarProductsSlider.vue'

const SFLazyStoreLocatorSlideIn = defineAsyncComponent(
  () => import('~/components/locator/SFStoreLocatorSlideIn.vue'),
)

const CURRENT_PRODUCT_DATA_KEY = 'PDP-currentProduct'

const { id } = defineProps<{ id: number }>()

definePageMeta({
  pageType: 'product_detail',
  key: 'PDP',
  props: true,
  validate(route) {
    return typeof route.params.id === 'string' && /^\d+$/.test(route.params.id)
  },
})
defineOptions({ name: 'ProductDetail' })

const route = useRoute()

const { trackError } = useGlobalEvents()
const {
  trackSelectPromotion,
  trackSelectCampaign,
  trackViewPromotion,
  trackViewCampaign,
} = usePromotionEvents()
const { trackViewItem } = useProductEvents()

const productAsyncData = await useProduct(
  {
    params: computed(() => ({
      id,
      with: PRODUCT_DETAIL_WITH_PARAMS,
    })),
    options: {
      dedupe: 'defer',
    },
  },
  CURRENT_PRODUCT_DATA_KEY,
)

const { data: product, error, status } = productAsyncData

whenever(
  error,
  (err) => {
    trackError({
      code: err?.statusCode,
      message: err?.statusMessage ?? 'product_detail_error',
    })
    throw createError({ ...err, fatal: true })
  },
  { immediate: true },
)
const {
  name,
  brand,
  description,
  longestCategoryList,
  hasOneVariantOnly,
  variants,
  image,
  color,
} = useProductBaseInfo(product)

const { items: basketItems, data: basketData } = useBasket()
const variantIdQueryParam = computed(() =>
  route.query.variantId
    ? parseInt(route.query.variantId?.toString())
    : undefined,
)

const onPromotionsVisible = (isVisible: boolean) => {
  if (!isVisible) {
    return
  }

  trackViewPromotion(promotions.value)
}

const onCampaignVisible = (isVisible: boolean) => {
  if (!isVisible || !campaign.value) {
    return
  }

  trackViewCampaign(campaign.value)
}

const activeVariant = computed<Variant | undefined>(() => {
  if (hasOneVariantOnly.value) {
    return variants.value[0]
  } else if (variantIdQueryParam.value) {
    return variants.value?.find(({ id }) => id === variantIdQueryParam.value)
  }
  return undefined
})

const router = useRouter()
const updateActiveVariant = async (newVariant?: Variant) => {
  if (!newVariant) {
    return
  }

  await router.replace({
    query: {
      ...route.query,
      variantId: newVariant?.id.toString(),
    },
  })
}

const basketItem = computed(() => {
  return basketItems.value?.find(
    ({ variant, customData }) =>
      variant.id === activeVariant.value?.id &&
      !hasSubscriptionCustomData(customData as Record<string, unknown>),
  )
})

const promotionData = useCurrentPromotions()
const { data: campaign } = useCampaign()

const promotions = computed(() => {
  return getPromotionsForProductDetailPage(
    product.value,
    promotionData.data?.value?.entities,
    basketItem.value,
  )
})

const buyXGetYPromotion = computed(() => {
  return getBuyXGetYPromotionForProductDetailPage(
    promotions.value,
    basketData.value?.applicablePromotions,
  )
})

const isPromotionApplied = (promotion: Promotion) => {
  // For tiered promotions, we check if the promotion is applied to the basket item by checking the applied reductions
  if (promotion.tiers?.length) {
    return basketItem.value?.price.total.appliedReductions.some(
      (reduction) => reduction.promotionId === promotion.id,
    )
  }

  // For all other promotions, we check if the promotion is applied to the basket item by checking the promotions attribute
  return basketItem.value?.promotions?.some(
    ({ id, isValid }) => id === promotion.id && isValid,
  )
}

const price = computed(() => {
  if (basketItem.value) {
    return basketItem.value.price.unit as Price
  } else if (activeVariant.value) {
    return activeVariant.value.price
  }
  return product.value?.priceRange?.min as Price
})

const lowestPriorPrice = computed(() => {
  if (basketItem.value) {
    return basketItem.value.lowestPriorPrice
  } else if (activeVariant.value) {
    return activeVariant.value.lowestPriorPrice
  }
  return product.value?.lowestPriorPrice
})
const showFrom = computed(
  () =>
    !activeVariant.value &&
    product.value?.priceRange?.min.withTax !==
      product.value?.priceRange?.max.withTax,
)

const recommendedProductIds = computed(() => {
  return getCombineWithProductIds(
    product.value?.advancedAttributes?.['combineWith'],
  )
})

// Store selector
const favoriteStoreId = useFavoriteStore()
const selectedStoreId = ref<number | undefined>(
  favoriteStoreId.value ?? undefined,
)

const { getBreadcrumbsFromProductCategories } = useBreadcrumbs()
const breadcrumbs = computed(() =>
  getBreadcrumbsFromProductCategories(longestCategoryList.value ?? []),
)

const { getImage } = useImage()
const { $config } = useNuxtApp()
const origin = useRequestOrigin()

const productInfo = computed(() => ({
  name: name.value,
  brand: brand.value,
  productDescription: description.value,
  variants: variants.value.map((variant) => {
    const size =
      getFirstAttributeValue(variant.attributes, ATTRIBUTE_KEY_SIZE)?.label ||
      ''
    return generateProductSchema({
      productName: `${name.value}, ${color.value}`,
      variant,
      url: `${origin}${join($config.app.baseURL, route.fullPath)}`,
      size,
      image: image.value
        ? getImage(image.value?.hash, {
            sizes: '100vw',
            // @ts-expect-error - Ignore until https://github.com/nuxt/image/issues/2036 is fixed
            provider: 'scayle',
          }).url
        : '',
    })
  }),
  productId: product.value?.id || 0,
  color: color.value,
  variesBy: variants.value.length > 1 ? ['https://schema.org/size'] : undefined,
}))

const category = computed(() => {
  // The most specific category of the product is the last category in the longest category list
  return longestCategoryList.value?.at(-1)
})
// SEO
const { canonicalLink, robots, title, productJsonLd, productBreadcrumbJsonLd } =
  useProductSeoData(
    breadcrumbs,
    () => ({
      baseUrl: origin,
      fullPath: join($config.app.baseURL, route.fullPath),
    }),
    productInfo,
  )

const i18n = useI18n()

useSeoMeta({
  title,
  description: () =>
    product.value
      ? i18n.t('product_detail_page.meta.description', {
          productName: name.value,
          shopName: $config.public.shopName,
        })
      : undefined,
  robots,
})

const params = computed(() => ({
  id,
  with: { attributes: { withKey: [ATTRIBUTE_KEY_NAME] } },
}))

// This request needs to be awaited to have the hreflang links available on server side. Additionally, it needs to be lazy to avoid blocking the page load.
const { data: productsForAllShops } = await useAllShopProductsForId({
  params,
  options: {
    lazy: true,
  },
})

const { getProductDetailRoute, getLocalizedHref } = useRouteHelpers()

const hreflangLinks = generateProductHreflangLinks(
  (productsForAllShops.value ?? []).map(({ product, path, locale }) => {
    const productPath = getProductDetailRoute(
      product.id,
      getFirstAttributeValue(product.attributes, ATTRIBUTE_KEY_NAME)?.label,
      path as Locale,
    )

    const productHref = getLocalizedHref(path as Locale, productPath)
    return {
      productHref,
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

useJsonld(() => [productBreadcrumbJsonLd.value, productJsonLd.value])

const getRouteBaseName = useRouteBaseName()

function redirectProductIfNecessary(product: Product) {
  // The redirect may only run once product, props and route describe the same
  // product. While one of them lags behind, it corrects a path that belongs to
  // another page and restarts the navigation that is already in flight.

  // The page is reused across product detail pages (`key: 'PDP'`), so `product`
  // is still the previous one for the first ticks after the route changed. Since
  // Nuxt 4.5.1 the request status stays `'success'` meanwhile, so it cannot
  // stand in for this check. `props: true` passes the route param as a string,
  // despite its `number` type.
  if (product.id !== Number(id)) {
    return
  }

  // Nuxt commits the route when the page's `Suspense` boundary resolves: it
  // describes the previous page while this one loads its product, and the next
  // page while this one is being left. The watcher below re-runs once the route
  // describes this product.
  if (
    getRouteBaseName(route) !== routeList.pdp.name ||
    getProductId(route.params) !== Number(id)
  ) {
    return
  }

  const expectedPath = getProductDetailRoute(
    product.id,
    getFirstAttributeValue(product.attributes, ATTRIBUTE_KEY_NAME)?.label,
  )

  if (expectedPath === route.path) {
    return
  }

  return navigateTo(
    { path: expectedPath, query: route.query, hash: route.hash },
    { redirectCode: 301 },
  )
}

watch(
  [product, () => route.path],
  ([product], [oldProduct]) => {
    if (!product) {
      return
    }
    redirectProductIfNecessary(product)

    if (oldProduct?.id !== product.id) {
      trackViewItem(product, activeVariant.value)
    }
  },
  { immediate: true },
)

// Clear the data when leaving the page
onUnmounted(() => {
  clearNuxtData(CURRENT_PRODUCT_DATA_KEY)
})

const { addProductId, loadMissingProducts } = useRecentlyViewedProducts()
// Because we do define the same key `PDP` in the `definePageMeta` hook, `onMounted` hook is not necessarily called when the PDP changes.
// Therefore we update the recently viewed products every time the current product changes.
// This also avoids the `beforeunload` event, which does not properly work on IOS.
whenever(
  product,
  async () => {
    if (import.meta.server) {
      return
    }
    // We load the products before adding the current product to the list.
    // This is to avoid showing the current product as first item in the recently viewed products slider.
    await loadMissingProducts()
    addProductId(id)
  },
  { immediate: true },
)
</script>

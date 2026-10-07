<template>
  <SFAsyncStatusWrapper :status="basketStatus">
    <SFEmptyState
      v-if="basketCount === 0"
      :title="$t('basket_page.empty_basket_title')"
      :description="$t('basket_page.empty_basket_description')"
    />
    <div
      v-else
      class="relative flex flex-col lg:flex-row"
      data-testid="basket-container"
    >
      <div
        class="mx-5 flex flex-col space-y-4 pb-8 pt-1.5 lg:ml-7 lg:mr-13 lg:w-3/5 lg:items-end lg:space-y-8 lg:py-8"
      >
        <SFBasketHeadline v-if="basketCount" :count="basketCount" />
        <div
          v-if="campaign || progressPromotions.length"
          class="flex w-full flex-col gap-6 lg:max-w-2xl"
        >
          <SFDealBanner
            v-if="campaign && hasCampaignReduction(basketCost)"
            v-element-visibility="onCampaignVisible"
            :display-data="getCampaignDisplayData(campaign)"
            @track-promotion="trackSelectCampaign(campaign)"
          />
          <SFDealBanner
            v-for="promotion in progressPromotions"
            :key="promotion.id"
            v-element-visibility="onPromotionVisible"
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

        <SFBuyXGetYProducts
          v-for="applicablePromotion in basketData?.applicablePromotions?.filter(
            (promotion) =>
              isBuyXGetYType(promotion.promotion) &&
              !isBuyXGetX(promotion.promotion),
          )"
          :key="applicablePromotion.promotion.id"
          are-gift-conditions-met
          :promotion="
            applicablePromotion.promotion as Promotion<BuyXGetYEffect>
          "
          class="w-full lg:min-w-md lg:max-w-2xl"
        />

        <SFBasketAvailableItems
          v-if="groupedBasketItems?.available"
          :available-items="groupedBasketItems?.available"
          :campaign="campaign"
          @update:quantity="updateBasketItemQuantity"
          @delete="deleteBasketItem($event)"
        />
        <template v-if="groupedBasketItems?.unavailable">
          <SFHeadline
            tag="h2"
            class="z-10 w-full rounded-lg border border-gray-300 bg-gray-100 px-5 py-2.5 text-md font-semibold text-secondary lg:max-w-2xl"
            data-testid="headline-unavailable-products"
          >
            {{ $t('basket.unavailable_products') }}:
          </SFHeadline>
          <SFBasketUnavailableItems
            :unavailable-items="groupedBasketItems?.unavailable"
            @delete="deleteBasketItem($event)"
          />
        </template>
      </div>
      <SFBasketSummary
        v-if="basketData"
        :basket="basketData"
        :campaign="campaign"
      />
      <SFBasketDeleteConfirmationModal
        :visible="isDeleteConfirmationRevealed"
        :on-confirm="confirmDeletion"
        :on-cancel="cancelDeletion"
      />
    </div>
    <template #loading>
      <SFBasketSkeleton />
    </template>
  </SFAsyncStatusWrapper>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useConfirmDialog, whenever } from '@vueuse/core'
import {
  sanitizeCanonicalURL,
  type BasketItem,
  type BuyXGetYEffect,
  type Promotion,
} from '@scayle/storefront-nuxt'
import { join } from 'pathe'
import { vElementVisibility } from '@vueuse/components'
import { useHead, useSeoMeta, definePageMeta } from '#imports'
import { createError, useNuxtApp } from '#app'
import { useRoute } from '#app/composables/router'
import {
  useBasketActions,
  useActivePromotions,
  useRequestOrigin,
} from '~/composables'
import { useBasket, useCampaign } from '#storefront/composables'
import SFAsyncStatusWrapper from '~/components/SFAsyncStatusWrapper.vue'
import SFBasketSkeleton from '~/components/basket/skeleton/SFBasketSkeleton.vue'
import SFBasketSummary from '~/components/basket/summary/SFBasketSummary.vue'
import SFEmptyState from '~/components/SFEmptyState.vue'
import { SFHeadline } from '#storefront-ui/components'
import SFBasketHeadline from '~/components/basket/SFBasketHeadline.vue'
import SFBasketDeleteConfirmationModal from '~/components/basket/SFBasketDeleteConfirmationModal.vue'
import SFBasketAvailableItems from '~/components/basket/SFBasketAvailableItems.vue'
import SFBasketUnavailableItems from '~/components/basket/SFBasketUnavailableItems.vue'
import SFDealBanner from '~/components/deal/SFDealBanner.vue'
import SFBuyXGetYProducts from '~/components/product/promotion/buyXGetY/SFBuyXGetYProducts.vue'
import { isBuyXGetYType } from '#storefront-promotions/utils'
import SFPromotionProgressWrapper from '~/components/product/promotion/banners/SFPromotionProgressWrapper.vue'
import {
  getCampaignDisplayData,
  getPromotionDisplayData,
  isTieredPromotion,
} from '~/utils/promotion'
import { hasCampaignReduction, isBuyXGetX } from '~/utils'
import SFComboDealWrapper from '~/components/product/promotion/banners/SFComboDealWrapper.vue'
import { isComboDealType } from '#storefront-promotions/utils/promotion'
import {
  useGlobalEvents,
  usePromotionEvents,
  useBasketEvents,
} from '#tracking/composables'

const route = useRoute()
const origin = useRequestOrigin()
const {
  data: basketData,
  items: basketItems,
  status: basketStatus,
  cost: basketCost,
  error: basketError,
  count: basketCount,
} = useBasket()

const {
  trackSelectPromotion,
  trackSelectCampaign,
  trackViewPromotion,
  trackViewCampaign,
} = usePromotionEvents()
const { trackError } = useGlobalEvents()
const { trackViewCart, trackRemoveFromBasket, trackAddToBasket } =
  useBasketEvents()

// We need to wait for the basket status to be fetched before tracking the view cart event
// This only has to be done once, so we use the `once` flag to ensure it only runs once.
// We also use the `immediate` flag to ensure it runs immediately if the basket status is already 'success'.
watch(
  basketStatus,
  (status) => {
    if (status === 'success') {
      trackViewCart(basketItems.value)
    }
  },
  { once: true, immediate: true },
)

whenever(
  basketError,
  (err) => {
    trackError({
      code: err?.statusCode,
      message: err?.statusMessage ?? 'basket_error',
    })
    throw createError({ ...err, fatal: true })
  },
  { immediate: true },
)
const { promotions: progressPromotions } = useActivePromotions()
const { data: campaign } = useCampaign()

const isPromotionApplied = (promotion: Promotion) => {
  return basketItems.value?.some(({ promotions, price }) => {
    // For tiered promotions, we check if the promotion is applied to the basket item by checking the applied reductions
    if (promotion.tiers?.length) {
      return price.total.appliedReductions.some(
        (reduction) => reduction.promotionId === promotion.id,
      )
    }

    // For all other promotions, we check if the promotion is applied to the basket item by checking the promotions attribute
    return promotions?.some(
      (basketPromotion) =>
        basketPromotion.id === promotion.id && basketPromotion.isValid,
    )
  })
}

const groupedBasketItems = computed(() =>
  Object.groupBy(basketItems.value || [], (item) => item.status),
)

const onCampaignVisible = (isVisible: boolean) => {
  if (!isVisible || !campaign.value) {
    return
  }

  trackViewCampaign(campaign.value)
}

const onPromotionVisible = (isVisible: boolean) => {
  if (!isVisible) {
    return
  }
  trackViewPromotion(progressPromotions.value)
}

const { updateItemQuantity, removeItem } = useBasketActions()

const {
  isRevealed: isDeleteConfirmationRevealed,
  reveal: revealDeleteConfirmation,
  confirm: confirmDeletion,
  cancel: cancelDeletion,
} = useConfirmDialog<undefined, boolean, boolean>()
const deleteBasketItem = async (item: BasketItem) => {
  const { isCanceled } = await revealDeleteConfirmation()
  if (isCanceled) {
    return
  }
  const success = await removeItem(item)
  if (success) {
    trackRemoveFromBasket(item)
  }
}

const updateBasketItemQuantity = async (
  item: BasketItem,
  newQuantity: number,
) => {
  const success = await updateItemQuantity(item, newQuantity)
  if (!success) {
    return
  }

  if (newQuantity > item.quantity) {
    trackAddToBasket(item.variant, item.product, newQuantity)
  } else {
    trackRemoveFromBasket(item)
  }
}

const { $i18n, $config } = useNuxtApp()

useSeoMeta({
  robots: 'noindex,follow',
  title: $i18n.t('basket_page.meta.title'),
  description: $i18n.t('basket_page.meta.description', {
    shopName: $config.public.shopName,
  }),
})

useHead(() => ({
  link: [
    {
      rel: 'canonical',
      key: 'canonical',
      href: sanitizeCanonicalURL(
        `${origin}${join($config.app.baseURL, route.fullPath)}`,
      ),
    },
  ],
}))

defineOptions({ name: 'BasketPage' })
definePageMeta({ pageType: 'basket' })
</script>

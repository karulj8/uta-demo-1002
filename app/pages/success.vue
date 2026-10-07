<template>
  <div class="-mb-16 max-lg:border-t">
    <SFAsyncDataWrapper :async-data="orderConfirmation">
      <div v-if="orderData" class="relative flex flex-col md:flex-row">
        <SFOspSummarySection :order-data="orderData" class="order-2" />
        <SFOspBasicDataSection :order-data="orderData" class="order-1" />
        <SFOspCtaButtons
          :order-data="orderData"
          class="order-3 bg-gray-100 px-5 py-4 md:hidden"
        />
      </div>
      <template #error>
        <SFEmptyState
          :title="$t('order_success_page.no_order_found.title')"
          :description="$t('order_success_page.no_order_found.description')"
          :show-default-actions="false"
        >
          <SFButton
            variant="tertiary"
            :to="getLocalizedRoute(routeList.home)"
            class="mt-10"
          >
            {{ $t('global.continue_shopping') }}
          </SFButton>
        </SFEmptyState>
      </template>
      <template #loading>
        <SFOspSkeleton />
      </template>
    </SFAsyncDataWrapper>
  </div>
</template>

<script setup lang="ts">
import { whenever } from '@vueuse/core'
import { HttpStatusCode } from '@scayle/storefront-nuxt'
import { useSeoMeta, definePageMeta } from '#imports'
import { useOrderConfirmation, useUser } from '#storefront/composables'
import { useRoute } from '#app/composables/router'
import SFAsyncDataWrapper from '~/components/SFAsyncDataWrapper.vue'
import SFEmptyState from '~/components/SFEmptyState.vue'
import SFOspBasicDataSection from '~/components/osp/SFOspBasicDataSection.vue'
import SFOspSummarySection from '~/components/osp/SFOspSummarySection.vue'
import SFOspCtaButtons from '~/components/osp/SFOspCtaButtons.vue'
import SFOspSkeleton from '~/components/osp/SFOspSkeleton.vue'
import type { OrderProduct, OrderVariant } from '#shared/types/order'
import { useI18n } from '#i18n'
import { useRouteHelpers } from '~/composables/useRouteHelpers'
import { SFButton } from '#storefront-ui/components'
import { routeList } from '~/utils/route'
import { createError } from '#app/composables/error'
import {
  useGlobalEvents,
  useOrderEvents,
  useTrackingContextState,
} from '#tracking/composables'

const { getLocalizedRoute } = useRouteHelpers()

const route = useRoute()
const cbdToken = String(route.query.cbd)

const { setPreviousPageContext } = useTrackingContextState()
// As we land on the success page from the checkout page with a full page reload, we lose the previous page context, so we need to set it manually.
setPreviousPageContext(
  getLocalizedRoute(routeList.checkout) as string,
  'checkout',
)

const { trackError, trackContentView } = useGlobalEvents()
const { trackPurchase } = useOrderEvents()

const orderConfirmation = await useOrderConfirmation<
  OrderProduct,
  OrderVariant
>({
  params: { cbdToken },
})

const { data: orderData, status, error } = orderConfirmation

const user = await useUser()

const { t } = useI18n()

if (import.meta.client && user.isLoggedIn) {
  await user.forceRefresh()
}

// On client side the order data is not available during initialization, because it is lazy loaded.
// We need to trigger the purchase event when the order data is available and the status is success.
whenever(
  () => orderData.value && status.value === 'success',
  () => {
    trackPurchase(orderData.value!)
    trackContentView()
  },
  { immediate: true },
)

useSeoMeta({
  robots: 'noindex,nofollow',
  title: () =>
    status.value === 'error'
      ? t('order_success_page.no_order_found.title')
      : t('order_success_page.meta.title'),
  description: () =>
    status.value === 'error'
      ? t('order_success_page.no_order_found.description')
      : t('order_success_page.meta.description'),
})

whenever(
  error,
  (err) => {
    if (err.statusCode === HttpStatusCode.BAD_REQUEST) {
      trackError({
        code: 400,
        message: err?.statusMessage ?? 'order_success_error',
      })
      return
    }
    trackError({
      code: err?.statusCode,
      message: err?.statusMessage ?? 'order_success_error',
    })
    throw createError({ ...err, fatal: true })
  },
  { immediate: true },
)

defineOptions({ name: 'OrderSuccessPage' })
definePageMeta({ pageType: 'order_success' })
</script>

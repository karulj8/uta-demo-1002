<template>
  <SFAsyncDataWrapper :async-data="orderPromise">
    <template #default="{ data }">
      <SFOrderDetailHeadline
        :id="id"
        :status="data.status"
        class="mb-5 xl:mb-7"
      />
      <SFOrderDetailBaseInformation :order-details="data" class="mb-4" />
      <SFOrderDetailProductList :order-details="data" />
      <SFOrderDetailPaymentSummary :cost="data.cost" />
    </template>
    <template #loading>
      <SFOrderDetailSkeletonLoader />
    </template>
  </SFAsyncDataWrapper>
</template>

<script setup lang="ts">
import { onMounted, onServerPrefetch } from 'vue'
import { HttpStatusCode } from '@scayle/storefront-nuxt'
import { useSeoMeta, definePageMeta } from '#imports'
import SFAsyncDataWrapper from '~/components/SFAsyncDataWrapper.vue'
import SFOrderDetailSkeletonLoader from '~/components/order/detail/SFOrderDetailSkeletonLoader.vue'
import SFOrderDetailBaseInformation from '~/components/order/detail/SFOrderDetailBaseInformation.vue'
import SFOrderDetailHeadline from '~/components/order/detail/SFOrderDetailHeadline.vue'
import SFOrderDetailProductList from '~/components/order/detail/SFOrderDetailProductList.vue'
import { useOrder } from '#storefront/composables'
import type { OrderProduct, OrderVariant } from '#shared/types/order'
import { createError } from '#app/composables/error'
import { useI18n } from '#i18n'
import SFOrderDetailPaymentSummary from '~/components/order/detail/SFOrderDetailPaymentSummary.vue'
import { useGlobalEvents } from '#tracking/composables'

const { t } = useI18n()

const { id } = defineProps<{ id: number }>()
const { trackError } = useGlobalEvents()
const orderPromise = useOrder<OrderProduct, OrderVariant>(
  { params: { orderId: id } },
  `orderId-${id}`,
)

const { data: orderDetails, status, error } = orderPromise

const validateOrderExists = async () => {
  await orderPromise

  if (error.value || (status.value !== 'pending' && !orderDetails.value)) {
    trackError({
      code: error.value?.statusCode,
      message: error.value?.statusMessage ?? 'order_error',
    })
    throw createError({ statusCode: HttpStatusCode.NOT_FOUND, fatal: true })
  }
}

onServerPrefetch(validateOrderExists)
onMounted(validateOrderExists)

useSeoMeta({
  robots: 'noindex, nofollow',
  title: () => t('order_detail_page.meta.title', { id: id }),
  description: () => t('order_detail_page.meta.description', { id: id }),
})

defineOptions({ name: 'OrderDetailsView' })
definePageMeta({
  props: true,
  pageType: 'account:order_id',
  validate(route) {
    return typeof route.params.id === 'string' && /^\d+$/.test(route.params.id!)
  },
})
</script>

<template>
  <div
    class="mt-1 flex items-center space-x-2 rounded-md bg-status-warning/10 px-3 py-1.5 text-sm leading-4 text-primary lg:mt-0.5"
    data-testid="basket-card-out-of-time-frame-title"
  >
    <IconAvailabilitySoldout class="size-4" />
    <span>
      {{ title }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '@scayle/storefront-nuxt'
import { IconAvailabilitySoldout } from '#components'
import { useI18n } from '#i18n'
import { useSellableTimeFrame } from '#storefront-product-detail'

const { timeframe } = defineProps<{
  timeframe: Product['sellableTimeframe']
}>()
const { t } = useI18n()

const { sellableTimeframeStartsInFuture, sellableTimeframeEndsInPast } =
  useSellableTimeFrame(timeframe)

const title = computed(() => {
  if (sellableTimeframeStartsInFuture.value) {
    return t('product_detail.sellable_in_future')
  }
  if (sellableTimeframeEndsInPast.value) {
    return t('product_detail.sellable_in_past')
  }
  return undefined
})
</script>

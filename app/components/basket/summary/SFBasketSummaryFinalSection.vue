<template>
  <section class="flex flex-col gap-4">
    <div class="flex items-start justify-between">
      <SFHeadline tag="h2" size="lg">{{
        $t('basket_summary.you_pay')
      }}</SFHeadline>
      <div class="mb-1 flex flex-col gap-1 text-sm text-secondary">
        <SFHeadline
          tag="span"
          size="lg"
          class="text-primary"
          data-testid="basket-final-price"
        >
          {{ formatCurrency(cost.withTax) }}
        </SFHeadline>
        <span v-if="tax > 0">{{ $t('global.including_vat') }}</span>
        <span v-if="tax === 0">{{ $t('global.excluding_vat') }}</span>
      </div>
    </div>
    <SFButton
      data-testid="checkout-link"
      size="xl"
      is-full-width
      variant="accent"
      @click="goToCheckout"
    >
      {{ $t('basket.go_to_checkout') }}
    </SFButton>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { BasketTotalPrice } from '@scayle/storefront-nuxt'
import { SFHeadline, SFButton } from '#storefront-ui/components'
import { useFormatHelpers } from '#storefront/composables'
import { useRouteHelpers } from '~/composables'
import { routeList } from '~/utils/route'
import { useCheckoutEvents } from '#tracking/composables'

const { cost } = defineProps<{
  cost: BasketTotalPrice
}>()

const { localizedNavigateTo } = useRouteHelpers()

const { formatCurrency } = useFormatHelpers()

const tax = computed<number>(() => cost.tax.vat.amount)

const { trackBeginCheckout } = useCheckoutEvents()

const goToCheckout = async () => {
  trackBeginCheckout(cost, 'regular')
  await localizedNavigateTo(routeList.checkout)
}
</script>

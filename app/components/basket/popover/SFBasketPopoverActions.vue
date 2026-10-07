<template>
  <div class="flex flex-col space-y-2 p-4">
    <SFButton
      variant="primary"
      size="lg"
      :to="getLocalizedRoute(routeList.checkout)"
      class="w-full"
      @click="trackBeginCheckout(cost, 'regular')"
    >
      {{ $t('basket.go_to_checkout') }}
    </SFButton>
    <SFButton
      variant="secondary"
      size="lg"
      :to="getLocalizedRoute(routeList.basket)"
      class="w-full"
    >
      {{ $t('basket_popover_actions.go_to_basket') }}
    </SFButton>
  </div>
</template>

<script setup lang="ts">
import { routeList } from '~/utils/route'
import { SFButton } from '#storefront-ui/components'
import { useRouteHelpers } from '~/composables'
import { useCheckoutEvents } from '#tracking/composables'
import { useBasket } from '#storefront/composables'

const { trackBeginCheckout } = useCheckoutEvents()
const { cost } = useBasket()
const { getLocalizedRoute } = useRouteHelpers()
</script>

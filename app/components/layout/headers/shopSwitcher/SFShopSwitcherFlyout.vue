<template>
  <SFSlideIn name="ShopSwitcherSlideIn" data-testid="shop-switcher-slide-in">
    <template #slide-in-header>
      <SFShopSwitcherFlyoutHeader />
    </template>
    <template #slide-in-body>
      <SFShopSwitcherFlyoutBody />
    </template>
  </SFSlideIn>
</template>
<script lang="ts" setup>
import SFShopSwitcherFlyoutBody from './SFShopSwitcherFlyoutBody.vue'
import SFShopSwitcherFlyoutHeader from './SFShopSwitcherFlyoutHeader.vue'
import { SFSlideIn } from '#storefront-ui/components'
</script>

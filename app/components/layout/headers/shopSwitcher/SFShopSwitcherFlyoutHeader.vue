<template>
  <div class="flex w-full items-center justify-between">
    <SFHeadline class="lg:text-lg" size="xl" tag="p">
      <IconUtilityLanguage class="size-6" />
      {{ $t('shop_selector.flyout_title') }}
    </SFHeadline>
    <SFButton
      class="my-3 -mr-2 bg-gray-200 lg:bg-transparent"
      fab
      variant="raw"
      data-testid="close-shopswitcher"
      :aria-label="$t('shop_selector.close_flyout')"
      @click="close"
    >
      <template #icon>
        <IconNavigationClose class="size-4 lg:size-4 lg:fill-secondary" />
      </template>
    </SFButton>
  </div>
</template>
<script lang="ts" setup>
import { IconNavigationClose, IconUtilityLanguage } from '#components'
import { SFHeadline, SFButton } from '#storefront-ui/components'
import { useSlideIn } from '#storefront-ui/composables'

const { close } = useSlideIn('ShopSwitcherSlideIn')
</script>

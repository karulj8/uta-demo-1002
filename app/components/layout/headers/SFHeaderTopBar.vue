<template>
  <div class="hidden h-9 w-full bg-accent font-semibold lg:flex">
    <div class="flex w-full px-4 lg:px-7">
      <div class="ml-auto flex gap-5 text-sm">
        <SFLocalizedLink
          data-testid="store-location-link"
          :to="routeList.location"
          raw
          class="flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2 text-white -outline-offset-2 hover:bg-status-info/10"
        >
          <IconUtilityMap class="size-3.5" />
          {{ $t('navigation.find_a_store') }}
        </SFLocalizedLink>
        <SFShopSwitcher listbox-button-aria-id="desktop-shop-switcher" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SFShopSwitcher from './shopSwitcher/SFShopSwitcher.vue'
import { IconUtilityMap } from '#components'
import SFLocalizedLink from '~/components/SFLocalizedLink.vue'
import { routeList } from '~/utils/route'
</script>

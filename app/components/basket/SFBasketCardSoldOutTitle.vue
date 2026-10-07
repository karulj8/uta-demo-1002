<script setup lang="ts">
import { IconAvailabilitySoldout } from '#components'
</script>

<template>
  <div
    class="mt-1 flex items-center space-x-2 rounded-md bg-status-alert/10 px-3 py-1.5 text-sm leading-4 text-status-alert lg:mt-0.5"
    data-testid="basket-card-sold-out-title"
  >
    <IconAvailabilitySoldout class="size-4" />
    <span>
      {{ $t('global.sold_out_long') }}
    </span>
  </div>
</template>

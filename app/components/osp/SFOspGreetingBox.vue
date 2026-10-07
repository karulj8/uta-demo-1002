<template>
  <div
    class="flex flex-col items-center gap-2 rounded-xl bg-status-success-light p-5"
    data-testid="osp-greeting-box"
  >
    <div
      class="mb-2 size-10 content-center rounded-full border-2 border-primary bg-white"
    >
      <IconCheckmarkDefault class="mx-auto size-3.5" />
    </div>
    <SFHeadline
      size="lg"
      class="flex items-center"
      data-testid="osp-greeting-box-headline"
    >
      {{ $t('order_success_page_greeting.title') }}
    </SFHeadline>
    <p class="text-sm text-secondary">
      {{ $t('order_success_page_greeting.email_confirmation') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Order } from '#shared/types/order'
import { SFHeadline } from '#storefront-ui/components'
import { IconCheckmarkDefault } from '#components'

defineProps<{ orderData: Order }>()
</script>

<template>
  <div
    class="flex h-5 items-center gap-1 rounded-md px-1.5 text-sm font-semibold text-primary"
    data-testid="order-status"
    :class="StatusMap[status].lightColor"
  >
    <div
      class="inline-block size-2 rounded-sm bg-primary"
      :class="StatusMap[status].defaultColor"
    />
    {{ StatusMap[status].label }}
  </div>
</template>

<script setup lang="ts">
import type { OrderStatus } from '@scayle/storefront-nuxt'
import { useI18n } from '#i18n'

const { status } = defineProps<{ status: OrderStatus }>()

const { t } = useI18n()

const StatusMap: Record<
  OrderStatus,
  Record<'label' | 'defaultColor' | 'lightColor', string>
> = {
  order_open: {
    label: t('order_status.open'),
    defaultColor: 'bg-status-warning',
    lightColor: 'bg-status-warning-light',
  },
  payment_pending: {
    label: t('order_status.open'),
    defaultColor: 'bg-status-warning',
    lightColor: 'bg-status-warning-light',
  },
  payment_reserved: {
    label: t('order_status.confirmed'),
    defaultColor: 'bg-status-success',
    lightColor: 'bg-status-success-light',
  },
  invoice_completed: {
    label: t('order_status.shipped'),
    defaultColor: 'bg-status-success',
    lightColor: 'bg-status-success-light',
  },
  invoice_partially_completed: {
    label: t('order_status.confirmed'),
    defaultColor: 'bg-status-success',
    lightColor: 'bg-status-success-light',
  },
  cancellation_completed: {
    label: t('order_status.cancelled'),
    defaultColor: 'bg-status-alert',
    lightColor: 'bg-status-alert-light',
  },
  cancellation_pending: {
    label: t('order_status.cancelled'),
    defaultColor: 'bg-status-alert',
    lightColor: 'bg-status-alert-light',
  },
}
</script>

<template>
  <component
    :is="componentName"
    v-bind="attributes"
    :aria-label="componentName === SFLink ? displayData?.headline : undefined"
    class="relative block w-full rounded-xl border text-white"
    :style="{ borderColor: displayData?.colorStyle.backgroundColor }"
    @click="track"
  >
    <SFDealTimer
      v-if="displayData?.expirationDate && !displayData?.hideCountdown"
      class="absolute z-10 -translate-y-1/2 translate-x-6"
      :time-until="displayData.expirationDate"
      data-testid="promotion-countdown"
      :color-style="displayData.colorStyle"
    />
    <div
      class="-m-px flex items-center justify-between rounded-xl px-6 py-4"
      :style="displayData.colorStyle"
    >
      <div>
        <div class="font-bold">{{ displayData?.headline }}</div>
        <div v-if="displayData?.subline" class="text-md">
          {{ displayData.subline }}
        </div>
      </div>
      <div v-if="isPromotionApplied" class="pl-2">
        <IconCheckmarkFilled class="size-6" />
      </div>
    </div>
    <ClientOnly>
      <template #fallback>
        <div class="flex w-full flex-col px-6 py-4">
          <SFSkeletonLoader
            v-for="n in 3"
            :key="n"
            type="custom"
            class="my-1 h-2 w-full rounded-sm"
          />
        </div>
      </template>
      <SFFadeInTransition>
        <div>
          <slot name="progress" />
          <div
            v-if="displayData?.conditions && showCondition"
            class="flex flex-col px-6 py-4 text-md text-secondary"
          >
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-1">
                <IconNotifyInfo class="size-4" />
                {{ $t('promotion.condition') }}
              </div>
              <div class="whitespace-break-spaces text-sm">
                {{ displayData.conditions }}
              </div>
            </div>
          </div>
        </div>
      </SFFadeInTransition>
    </ClientOnly>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SFDealTimer from '~/components/deal/SFDealTimer.vue'
import { SFLink } from '~~/modules/ui/runtime/components'
import { ClientOnly, IconCheckmarkFilled, IconNotifyInfo } from '#components'
import { SFSkeletonLoader, SFFadeInTransition } from '#storefront-ui/components'
import type { DealDisplayData } from '#shared/types/promotion'

const { displayData, showCondition = false } = defineProps<{
  displayData: DealDisplayData
  /**
   * Controls the visibility of promotion conditions.
   */
  showCondition?: boolean
  /**
   * Shows a checkmark if the promotion is applied.
   */
  isPromotionApplied?: boolean
}>()

const emit = defineEmits<{ trackPromotion: [] }>()

function track() {
  if (!displayData?.link) {
    return
  }
  emit('trackPromotion')
}

const componentName = computed(() => (displayData?.link ? SFLink : 'div'))

const attributes = computed(() => ({
  ...(displayData?.link && { raw: true, to: displayData.link }),
}))
</script>

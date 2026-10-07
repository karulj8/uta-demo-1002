<template>
  <component
    :is="component"
    v-bind="attributes"
    class="flex justify-between px-4 lg:justify-around lg:px-7"
    data-testid="promotion-ribbon"
    :style="displayData.colorStyle"
  >
    <div class="flex items-center justify-between space-x-4 py-3 max-lg:w-full">
      <div
        class="flex flex-col lg:flex-row"
        :class="{ 'lg:divide-x': displayData.subline }"
      >
        <span
          class="text-md font-semibold lg:pr-1"
          data-testid="promotion-ribbon-headline"
          >{{ displayData.headline }}</span
        >
        <span
          clasS="text-sm font-normal leading-none lg:pl-1 lg:text-md lg:font-semibold"
          data-testid="promotion-ribbon-subheadline"
          :style="{ borderColor: displayData.colorStyle.color }"
        >
          {{ displayData.subline }}
        </span>
      </div>
      <SFDealTimer
        v-if="!displayData.hideCountdown && displayData.expirationDate"
        :time-until="displayData.expirationDate"
        :color-style="displayData.colorStyle"
        data-testid="promotion-ribbon-timer"
      />
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SFDealTimer from '~/components/deal/SFDealTimer.vue'
import SFLink from '~~/modules/ui/runtime/components/links/SFLink.vue'
import type { DealDisplayData } from '#shared/types/promotion'

const { displayData } = defineProps<{
  displayData: DealDisplayData
}>()

const component = computed(() => {
  return displayData.link ? SFLink : 'div'
})
const attributes = computed(() => ({
  ...(displayData.link && {
    raw: true,
    to: displayData.link,
  }),
}))
</script>

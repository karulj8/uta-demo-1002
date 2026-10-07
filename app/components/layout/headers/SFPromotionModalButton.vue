<template>
  <SFButton
    variant="raw"
    class="rounded-md p-2 hover:bg-gray-200"
    data-testid="promotion-header-button"
    :aria-label="
      promotionCount
        ? $t('promotion_slide_in.open_button.active_promotions_title', {
            total: promotionCount,
          })
        : $t('promotion_slide_in.open_button.no_active_promotions_title')
    "
    @click="openPromotionModal"
  >
    <template #icon>
      <IconCommercePromotion class="size-5 shrink-0" />
    </template>
    <template v-if="promotionCount">
      <div
        class="min-w-[1ch] content-center text-sm font-semibold leading-none"
      >
        {{ promotionCount }}
      </div>
    </template>
  </SFButton>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IconCommercePromotion } from '#components'
import { useSlideIn } from '~~/modules/ui/runtime'
import SFButton from '~~/modules/ui/runtime/components/core/SFButton.vue'
import { usePromotionEvents, useGlobalEvents } from '#tracking/composables'
import { useCurrentPromotions, useCampaign } from '#storefront/composables'

const { trackViewPromotion } = usePromotionEvents()
const { trackContentView } = useGlobalEvents()
const { toggle } = useSlideIn('PromotionSlideIn')

const { data: promotions } = useCurrentPromotions()
const { data: campaign } = useCampaign()

const promotionCount = computed(() => {
  return Number(!!campaign.value) + (promotions?.value?.entities.length || 0)
})

function openPromotionModal() {
  trackViewPromotion(promotions?.value?.entities ?? [])
  trackContentView({ page: { interaction_source: 'deals_flyout' } })
  toggle()
}
</script>

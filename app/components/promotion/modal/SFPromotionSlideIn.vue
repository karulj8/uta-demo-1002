<template>
  <SFSlideIn name="PromotionSlideIn">
    <template #slide-in-header="{ toggle: toggleItem }">
      <div class="flex w-full items-center justify-between">
        <SFHeadline tag="p">
          {{ $t('promotion_slide_in.headline') }}
        </SFHeadline>
        <SFButton
          class="group my-3 -mr-2 bg-gray-200 md:bg-transparent hover:md:bg-gray-200"
          fab
          variant="raw"
          data-testid="close-promotions"
          :aria-label="$t('global.close')"
          @click="toggleItem"
        >
          <template #icon>
            <IconNavigationClose
              class="size-5 md:fill-secondary group-hover:md:fill-primary"
            />
          </template>
        </SFButton>
      </div>
    </template>
    <template #slide-in-body>
      <div class="p-6">
        <div class="mb-2 flex items-center gap-2 font-semibold">
          {{
            promotionsSortedByPriority.length || campaign
              ? $t('promotion_slide_in.active_promotions')
              : $t('promotion_slide_in.no_active_promotions')
          }}
          <SFBadge
            v-if="promotionsSortedByPriority.length || campaign"
            :badge="promotionsSortedByPriority.length + Number(!!campaign)"
            data-testid="promotion-counter"
          />
        </div>
        <div class="mb-8 text-md">{{ $t('promotion_slide_in.subline') }}</div>

        <div v-if="!promotionsSortedByPriority.length && !campaign">
          {{ $t('promotion_slide_in.no_active_subline') }}
        </div>
        <ul v-else class="flex flex-col gap-6">
          <li v-if="campaign" data-testid="campaign-card">
            <SFDealBanner
              :display-data="getCampaignDisplayData(campaign)"
              show-condition
              @track-promotion="trackSelectCampaign(campaign)"
            />
          </li>
          <li
            v-for="promotion in promotionsSortedByPriority"
            :key="promotion?.id"
            data-testid="promotion-card"
          >
            <SFDealBanner
              :display-data="getPromotionDisplayData(promotion)"
              show-condition
              @track-promotion="trackSelectPromotion(promotion)"
            >
              <template #progress>
                <SFComboDealWrapper
                  v-if="isComboDealType(promotion)"
                  :promotion="promotion"
                />
                <SFPromotionProgressWrapper
                  v-else-if="isTieredPromotion(promotion)"
                  :promotion="promotion"
                />
              </template>
            </SFDealBanner>
          </li>
        </ul>
      </div>
    </template>
  </SFSlideIn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Promotion, Campaign } from '@scayle/storefront-nuxt'
import {
  SFSlideIn,
  SFButton,
  SFHeadline,
  SFBadge,
} from '#storefront-ui/components'
import SFDealBanner from '~/components/deal/SFDealBanner.vue'
import { sortPromotionsByPriority } from '#storefront-promotions/utils'
import SFPromotionProgressWrapper from '~/components/product/promotion/banners/SFPromotionProgressWrapper.vue'
import SFComboDealWrapper from '~/components/product/promotion/banners/SFComboDealWrapper.vue'
import {
  getCampaignDisplayData,
  getPromotionDisplayData,
  isTieredPromotion,
} from '~/utils/promotion'
import { isComboDealType } from '#storefront-promotions/utils/promotion'
import { IconNavigationClose } from '#components'
import { usePromotionEvents } from '#tracking/composables'

const { promotions = [], campaign } = defineProps<{
  promotions?: Promotion[]
  campaign?: Campaign | null
}>()
const { trackSelectPromotion, trackSelectCampaign } = usePromotionEvents()

const promotionsSortedByPriority = computed(() =>
  promotions.toSorted(sortPromotionsByPriority),
)
</script>

<template>
  <div class="max-lg:py-2">
    <SFButton
      ref="button"
      variant="raw"
      :listbox-button-aria-id="listboxButtonAriaId"
      :aria-label="
        $t('shop_selector.aria_label', {
          selectedCountry,
          selectedLanguage,
        })
      "
      aria-haspopup="true"
      :aria-expanded="isOpen"
      class="h-full gap-1.5 px-2 !text-secondary -outline-offset-2 hover:bg-status-info/10 lg:!text-white"
      data-testid="language-listbox"
      @click="openShopSwitcher"
    >
      <template #icon>
        <IconUtilityLanguage
          class="size-5 lg:size-3.5"
          data-testid="shop-switcher-globe-icon"
        />
      </template>
      <div class="text-lg lg:text-sm" data-testid="shop-switcher-current-shop">
        {{ getShopName(currentShop.locale, multipleShopsForCountry) }}
      </div>
      <template #append-icon>
        <IconNavigationDown
          class="size-2.5 transition-all"
          data-testid="shop-icon-chevron"
          :class="{ 'rotate-180': isOpen }"
        />
      </template>
    </SFButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAvailableShops, useCurrentShop } from '#storefront/composables'
import { SFButton } from '#storefront-ui/components'
import { useSlideIn } from '~~/modules/ui/runtime/composables/useSlideIn'
import { useCurrentShopTranslators } from '~/composables/useCurrentShopTranslators'
import { getShopName, hasMultipleShopsForCountry } from '~/utils'
import { IconNavigationDown, IconUtilityLanguage } from '#components'
import { useGlobalEvents } from '#tracking/composables'

const currentShop = useCurrentShop()
const availableShops = useAvailableShops()

const { isOpen, toggle } = useSlideIn('ShopSwitcherSlideIn')
const { trackContentView } = useGlobalEvents()

const { languageTranslator, regionTranslator } = useCurrentShopTranslators()

const openShopSwitcher = () => {
  toggle()
  trackContentView({
    page: {
      interaction_source: 'change_shop_flyout',
    },
  })
}

const selectedLanguage = computed(() => {
  if (!currentShop.value) {
    return
  }
  const [language] = currentShop.value.locale.split('-')
  return languageTranslator.value?.of(language!)
})

const selectedCountry = computed(() => {
  if (!currentShop.value) {
    return
  }
  const [, region] = currentShop.value.locale.split('-')

  return region ? regionTranslator.value?.of(region) : null
})

const multipleShopsForCountry = computed(() =>
  hasMultipleShopsForCountry(availableShops.value),
)
defineProps<{
  listboxButtonAriaId: string
}>()
</script>

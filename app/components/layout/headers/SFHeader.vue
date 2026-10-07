<template>
  <header
    class="flex h-13 items-center space-x-4 border-gray-300 px-4 lg:relative lg:h-16 lg:space-x-7 lg:border-b lg:px-7"
    data-testid="header"
  >
    <SFButton
      variant="raw"
      class="shrink-0 lg:hidden"
      data-testid="side-navigation-button"
      :aria-label="$t('navigation.a11ly.side_navigation')"
      @click="isSideNavigationOpen = !isSideNavigationOpen"
    >
      <template #icon>
        <IconNavigationClose v-if="isSideNavigationOpen" class="size-5" />
        <IconNavigationMenu v-else class="size-6" />
      </template>
    </SFButton>

    <SFSlideInFromLeftTransition>
      <SFMobileSidebar
        v-popover="isSideNavigationOpen"
        class="absolute top-13 !m-0 h-[calc(100dvh-52px)] w-screen bg-white !p-0"
        :class="{
          'block-scrolling': isSideNavigationOpen,
          hidden: !isSideNavigationOpen,
        }"
        :is-open="isSideNavigationOpen"
        :navigation-items="mainNavigationItems"
        @close="isSideNavigationOpen = false"
      />
    </SFSlideInFromLeftTransition>

    <SFLogoLink
      data-testid="header-logo"
      class="lg:!ml-0"
      @click="isSideNavigationOpen = false"
    />

    <nav class="h-full grow max-lg:hidden" data-testid="nav-categories">
      <ul class="flex h-full grow-[2]">
        <SFHeaderNavigationItem
          v-for="item in mainNavigationItems"
          :key="item.id"
          :item="item"
        />
      </ul>
    </nav>
    <SFSearchInput
      id="search-desktop"
      class="shrink grow max-lg:hidden"
      data-testid="search-desktop"
    />
    <div class="flex items-center max-lg:grow max-lg:justify-end">
      <SFUserNavigationItem
        class="mr-[1ch]"
        :block-popup="isSideNavigationOpen"
        @click="isSideNavigationOpen = false"
      />
      <SFPromotionModalButton />
      <SFWishlistNavigationItem @click="isSideNavigationOpen = false" />
      <SFBasketNavigationItem
        :block-popup="isSideNavigationOpen || isBasketPage"
        @click="isSideNavigationOpen = false"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { whenever } from '@vueuse/core'
import SFLogoLink from '../../SFLogoLink.vue'
import SFUserNavigationItem from './SFUserNavigationItem.vue'
import SFBasketNavigationItem from './SFBasketNavigationItem.vue'
import SFWishlistNavigationItem from './SFWishlistNavigationItem.vue'
import SFSearchInput from './search/SFSearchInput.vue'
import SFMobileSidebar from './SFMobileSidebar.vue'
import SFHeaderNavigationItem from './SFHeaderNavigationItem.vue'
import SFPromotionModalButton from './SFPromotionModalButton.vue'
import { vPopover } from '~~/modules/ui/runtime/directives/popover'
import { routeList, createCacheFriendlyTimestamp } from '~/utils'
import {
  SFButton,
  SFSlideInFromLeftTransition,
} from '~~/modules/ui/runtime/components'
import { useNavigationsByReferenceKey } from '#storefront-navigation/composables'
import { useDefaultBreakpoints } from '~~/modules/ui/runtime'
import { useLocalePath } from '#i18n'
import { useRoute } from '#app/composables/router'
import { IconNavigationMenu } from '#components'

const isSideNavigationOpen = defineModel('isMobileSidebarOpen', {
  type: Boolean,
  default: false,
})

const route = useRoute()
const localePath = useLocalePath()

const { greaterOrEqual } = useDefaultBreakpoints()
const isDesktopLayout = greaterOrEqual('lg')

whenever(isDesktopLayout, () => {
  isSideNavigationOpen.value = false
})

const isBasketPage = computed(() => route.path === localePath(routeList.basket))

const { data: navigationTree } = useNavigationsByReferenceKey(
  {
    params: {
      referenceKey: 'header',
      with: { category: true },
      visibleAt: createCacheFriendlyTimestamp(),
    },
  },
  'header',
)

const mainNavigationItems = computed(() => navigationTree.value?.items)
</script>

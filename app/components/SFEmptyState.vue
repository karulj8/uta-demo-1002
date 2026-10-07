<template>
  <div
    class="flex flex-col items-center justify-center rounded py-10 md:px-10"
    data-testid="empty-state"
  >
    <div class="flex h-56 w-full justify-center" data-testid="empty-state-icon">
      <img
        v-if="pageType === 'basket'"
        :src="'/basket_empty.svg'"
        :alt="$t('basket_page.empty_basket_title')"
      />
      <img
        v-else-if="pageType === 'wishlist'"
        :src="'/wishlist_empty.svg'"
        :alt="$t('wishlist_page.empty_wishlist_title')"
      />
    </div>
    <div class="px-14 text-center md:w-lg md:px-0">
      <SFHeadline
        v-if="title"
        tag="h1"
        class="!block"
        size="3xl"
        data-testid="empty-state-headline"
      >
        {{ title }}
      </SFHeadline>
      <p
        v-if="description"
        class="mt-4 !block text-lg font-normal leading-5 text-secondary"
        data-testid="empty-state-subheadline"
      >
        {{ description }}
      </p>
      <div
        v-if="showDefaultActions"
        class="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
      >
        <SFButton
          v-if="!isLoggedIn"
          size="lg"
          :to="getLocalizedRoute(routeList.signin)"
          data-testid="button-signin"
        >
          {{ $t('global.sign_in') }}
        </SFButton>
        <SFButton
          size="lg"
          :to="getLocalizedRoute(routeList.home)"
          variant="tertiary"
          data-testid="button-continue-shopping"
        >
          {{ $t('global.continue_shopping') }}
        </SFButton>
      </div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUser } from '#storefront/composables'
import { routeList } from '~/utils/route'
import { SFButton, SFHeadline } from '#storefront-ui/components'
import { useRouteHelpers } from '~/composables'

const {
  title = '',
  description = '',
  showDefaultActions = true,
  pageType = 'basket',
} = defineProps<{
  title?: string
  description?: string
  showDefaultActions?: boolean
  pageType?: 'basket' | 'wishlist'
}>()

const { isLoggedIn } = useUser()

const { getLocalizedRoute } = useRouteHelpers()
</script>

<template>
  <div class="w-64">
    <div class="space-y-1 border-b border-gray-400 p-5">
      <div class="text-md font-semibold" data-testid="greeting-user-firstname">
        {{
          $t('user_navigation_item.greeting', {
            firstName: user?.firstName,
          })
        }}
      </div>
      <div
        v-if="user?.email"
        class="text-sm leading-5 text-secondary"
        data-testid="user-popover-email"
      >
        {{ user?.email }}
      </div>
    </div>
    <div v-if="!isGuest" class="border-b border-gray-400 p-2">
      <SFAccountLink
        :to="routeList.profile"
        :label="$t('user_navigation_item.menu_items.profile')"
        icon="IconUserSettings"
        data-testid="user-flyout-profile-link"
        @click="$emit('close')"
      />
      <SFAccountLink
        :to="routeList.orders"
        :label="$t('user_navigation_item.menu_items.orders')"
        icon="IconCommerceBasket"
        data-testid="user-flyout-orders-link"
        @click="$emit('close')"
      />
      <SFAccountLink
        :to="routeList.subscriptionOverview"
        :label="$t('user_navigation_item.menu_items.subscriptions')"
        icon="IconUserSubscription"
        data-testid="user-flyout-subscriptions-link"
        @click="$emit('close')"
      />
    </div>
    <div class="p-2">
      <SFButton
        variant="raw"
        :disabled="isSubmitting"
        class="group flex w-full items-center !justify-start space-x-3 rounded-md px-3 py-2.5 hover:bg-gray-200 disabled:border-none disabled:!bg-white"
        data-testid="user-popover-logout-button"
        @click="handleLogout"
      >
        <span
          class="text-md leading-5 text-secondary group-hover:text-primary group-disabled:!text-secondary"
        >
          {{ $t('global.sign_out') }}
        </span>
      </SFButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import SFAccountLink from './SFAccountLink.vue'
import { useLog, useUser } from '#storefront/composables'
import { useAuthentication } from '~/composables'
import { routeList } from '~/utils/route'
import { SFButton } from '#storefront-ui/components'
import { useGlobalEvents } from '#tracking/composables'

const emit = defineEmits<{
  close: []
}>()

const { user } = useUser()
const { logout } = useAuthentication()
const isSubmitting = ref(false)
const log = useLog('SFUserActions')
const { trackError } = useGlobalEvents()
const isGuest = computed(() => user.value?.status?.isGuestCustomer)

const handleLogout = async () => {
  try {
    await logout()
    emit('close')
  } catch (error) {
    trackError({ message: 'logout_error' })
    log.error('Error during logging out', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

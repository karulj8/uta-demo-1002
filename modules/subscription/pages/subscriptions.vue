<template>
  <div>
    <SFHeadline
      class="mb-5 xl:mb-7"
      tag="h2"
      data-testid="subscriptions-headline"
    >
      {{ $t('subscription_page.headline') }}
    </SFHeadline>
    <subscription-overview
      v-if="accessToken && script.status.value === 'loaded'"
      :base-url="apiUrl"
      :customer-token="accessToken"
      :shop-id="shopId"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '#i18n'
import {
  useSeoMeta,
  definePageMeta,
  useRuntimeConfig,
  useScript,
} from '#imports'
import { useCurrentShop, useRpc } from '#storefront/composables'
import { SFHeadline } from '#storefront-ui/components'

const currentShop = useCurrentShop()
const shopId = currentShop.value.shopId

const runtimeConfig = useRuntimeConfig()
const { overviewWebHost, apiUrl } = runtimeConfig.public.subscription

const { data: accessToken } = useRpc(
  'getAccessToken',
  'subscription-accessToken',
  { forceTokenRefresh: true },
  { server: false },
)

/**
 * Load the script which contains the subscription overview web component.
 *
 * @see https://scripts.nuxt.com/docs/api/use-script
 */
const script = useScript({
  src: overviewWebHost,
  tagPriority: 'high',
  defer: true,
  async: true,
  key: 'subscription-overview-web-component',
})

const { t } = useI18n()

useSeoMeta({
  robots: 'noindex, nofollow',
  title: t('subscription_page.meta.title'),
  description: t('subscription_page.meta.description'),
})

definePageMeta({ pageType: 'subscription' })
defineOptions({ name: 'SubscriptionPage' })
</script>

<template>
  <section class="container my-10 overflow-hidden py-2 max-md:max-w-none">
    <subscription-cancellation
      v-if="script.status.value === 'loaded'"
      :base-url="apiUrl"
      :shop-id="shopId"
    />
  </section>
</template>

<script setup lang="ts">
import { useHead, definePageMeta, useRuntimeConfig, useScript } from '#imports'
import { useI18n } from '#i18n'
import { useCurrentShop } from '#storefront/composables'

const currentShop = useCurrentShop()
const shopId = currentShop.value.shopId

const runtimeConfig = useRuntimeConfig()
const { cancellationWebHost, apiUrl } = runtimeConfig.public.subscription

/**
 * Load the script which contains the subscription cancellation web component.
 *
 * @see https://scripts.nuxt.com/docs/api/use-script
 */
const script = useScript({
  src: cancellationWebHost,
  tagPriority: 'high',
  defer: true,
  key: 'subscription-cancellation-web-component',
})

const i18n = useI18n()
useHead({
  titleTemplate: (pageTitle) => pageTitle ?? null,
  title: i18n.t('subscription_page.headline'),
})

definePageMeta({ pageType: 'subscription_cancellation' })
</script>

<template>
  <div
    :data-amplience-entry-id="data?._meta?.deliveryId"
    data-amplience-field-id="components"
  >
    <slot v-if="shouldShowLoadingState" name="loading" />
    <template v-else-if="data">
      <AmplienceComponent
        v-for="(element, index) in data.components ?? []"
        :key="index"
        :content-element="element"
      />
    </template>
    <div v-else class="p-6 text-center text-secondary">
      No content found for delivery key "{{ slug }}". Create content in
      Amplience with this delivery key.
    </div>
  </div>
</template>
<script lang="ts" setup>
import { join } from 'pathe'
import { sanitizeCanonicalURL } from '@scayle/storefront-nuxt'
import { useAvailableShops } from '@scayle/storefront-nuxt/composables'
import { computed } from 'vue'
import { useCMSBySlug } from '../composables/useCMSBySlug'
import {
  generateAmplienceHreflangLinks,
  isInEditorMode,
} from '../utils/helpers'
import type { PageComponent } from '../types/gen'
import AmplienceComponent from './AmplienceComponent.vue'
import { useHead, useRoute, useNuxtApp, useSeoMeta } from '#app'
import { useI18n, useLocalePath, type Locale } from '#i18n'
import { useRequestOrigin, useRouteHelpers } from '~/composables'

const { slug } = defineProps<{
  slug: string
}>()

const route = useRoute()

const { data, status } = await useCMSBySlug<PageComponent>(
  `cms-content-${slug}`,
  slug,
)

useSeoMeta({
  title: () => data.value?.metaTitle,
  description: () => data.value?.metaDescription,
  robots: () => data.value?.robots,
})

const origin = useRequestOrigin()
const {
  $config: {
    app: { baseURL },
  },
} = useNuxtApp()

const { getLocalizedHref } = useRouteHelpers()
const i18n = useI18n()
const availableShops = useAvailableShops()
const localePath = useLocalePath()
const hreflangLinks = generateAmplienceHreflangLinks(
  availableShops.value.flatMap(({ locale, path }) => {
    if (!locale || !path) {
      return []
    }

    const href = getLocalizedHref(
      path as Locale,
      localePath(`/${slug}`, path as Locale),
    )

    return {
      locale,
      href,
      path,
    }
  }),
  i18n.defaultLocale,
)

useHead(() => ({
  link: [
    {
      rel: 'canonical',
      key: 'canonical',
      href: sanitizeCanonicalURL(
        `${origin}${join(baseURL, route.fullPath)}`,
        [],
      ),
    },
    ...(slug === 'homepage' ? [] : hreflangLinks),
  ],
}))

const shouldShowLoadingState = computed(() => {
  if (isInEditorMode(route) && data.value) {
    return false
  }
  return status.value === 'pending'
})
</script>

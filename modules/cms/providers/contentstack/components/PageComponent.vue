<template>
  <div v-live-preview:content="data">
    <slot v-if="shouldShowLoadingState" name="loading" />
    <template v-else>
      <ContentstackComponent
        v-for="(element, index) in data?.content"
        :key="element.uid"
        v-live-preview:[`content__${index}`].loop="data"
        :content-element="element"
      />
    </template>
  </div>
</template>
<script lang="ts" setup>
import { join } from 'pathe'
import { HttpStatusCode, sanitizeCanonicalURL } from '@scayle/storefront-nuxt'
import { whenever } from '@vueuse/core'
import { useAvailableShops } from '@scayle/storefront-nuxt/composables'
import { computed } from 'vue'
import { useCMSBySlug } from '../composables/useCMS'
import { generateContentstackHreflangLinks } from '../utils/helper'
import { vLivePreview } from '../directives/livePreview'
import type { PageComponent } from '../types/gen/contentstack'
import { isInEditorMode } from '../utils/utils'
import ContentstackComponent from './ContentstackComponent.vue'
import { createError, useSeoMeta, useRoute, useNuxtApp, useHead } from '#app'
import { useI18n, useLocalePath, type Locale } from '#i18n'
import { useRequestOrigin, useRouteHelpers } from '~/composables'

const { slug } = defineProps<{
  slug: string
}>()

const { data, status, error } = await useCMSBySlug<PageComponent>(
  `cms-content-${slug}`,
  slug,
  'page-component',
)

whenever(
  error,
  () => {
    throw createError({
      ...(error.value?.cause
        ? error.value.cause
        : {
            statusCode: HttpStatusCode.NOT_FOUND,
          }),
      fatal: true,
    })
  },
  { immediate: true },
)

useSeoMeta({
  title: () => data.value?.seo?.meta_title,
  description: () => data.value?.seo?.meta_description,
  robots: () => data.value?.seo?.robots,
})

const route = useRoute()
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
const hreflangLinks = generateContentstackHreflangLinks(
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
      rel: 'canonical' as const,
      href: sanitizeCanonicalURL(
        `${origin}${join(baseURL, route.fullPath)}`,
        [],
      ),
    },
    ...(slug === 'homepage' ? [] : hreflangLinks),
  ],
}))

const shouldShowLoadingState = computed(() => {
  // If we're in editor mode and data is already loaded, don't display the loading state when loading updates.
  // This ensures the editor maintains a reference to the updated content, minimizing flicker and creating a smoother editing experience.
  if (isInEditorMode(route) && data.value) {
    return false
  }
  return status.value === 'pending'
})
</script>

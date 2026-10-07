<template>
  <div
    :data-contentful-entry-id="data?.sys?.id"
    data-contentful-field-id="content"
  >
    <slot v-if="status === 'pending'" name="loading" />
    <template v-else>
      <ContentfulComponent
        v-for="element in data?.fields.content"
        :key="element?.sys.id"
        :content-element="element"
      />
    </template>
  </div>
</template>
<script lang="ts" setup>
import { whenever } from '@vueuse/core'
import { HttpStatusCode, sanitizeCanonicalURL } from '@scayle/storefront-nuxt'
import { join } from 'pathe'
import { useCMSBySlug } from '../composables/useCMS'
import type { TypePageComponentSkeleton } from '../types'
import { useContentfulEditor } from '../composables/useContentfulEditor'
import { generateContentfulHreflangLinks } from '../utils/helpers'
import ContentfulComponent from './ContentfulComponent.vue'
import { useAvailableShops } from '#storefront/composables'
import { useNuxtApp } from '#app/nuxt'
import { createError, useHead, useRoute, useSeoMeta } from '#imports'
import { useRequestOrigin, useRouteHelpers } from '~/composables'
import { useLocalePath, type Locale, useI18n } from '#i18n'

const { slug } = defineProps<{
  slug: string
}>()

const { data, status, error, fetchSpace } =
  await useCMSBySlug<TypePageComponentSkeleton>(`cms-content-${slug}`, {
    content_type: 'PageComponent',
    'fields.slug[match]': slug,
  })

useContentfulEditor(data)

// Handle errors
whenever(
  error,
  (newError) => {
    throw createError({
      ...('statusCode' in newError
        ? {
            ...newError,
            statusMessage: (newError?.cause as Error)?.name,
          }
        : {
            statusCode: HttpStatusCode.NOT_FOUND,
          }),
      fatal: true,
    })
  },
  { immediate: true },
)
//Handle no page found
whenever(
  () => status.value === 'success' && data.value === undefined,
  () => {
    throw createError({
      statusCode: HttpStatusCode.NOT_FOUND,
      message: `No page found for slug: ${slug}`,
      fatal: true,
    })
  },
)

useSeoMeta({
  title: () => data.value?.fields.metaTitle,
  description: () => data.value?.fields.metaDescription,
  robots: () => data.value?.fields.robots,
})

const route = useRoute()
const origin = useRequestOrigin()
const {
  $config: {
    app: { baseURL },
  },
} = useNuxtApp()

const { getLocalizedHref } = useRouteHelpers()
const localePath = useLocalePath()
const availableShops = useAvailableShops()
const { data: space } = await fetchSpace()
const i18n = useI18n()
const shops = availableShops.value

const hreflangLinks = generateContentfulHreflangLinks(
  shops.flatMap(({ locale: shopLocale, path }) => {
    const locale = space.value?.locales.find((locale) =>
      Array.isArray(shopLocale)
        ? shopLocale.includes(locale.code)
        : shopLocale === locale.code,
    )

    if (!locale || !path) {
      return []
    }

    const href = getLocalizedHref(
      path as Locale,
      localePath(`/${slug}`, path as Locale),
    )

    return {
      locale: locale.code,
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
</script>
